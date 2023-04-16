import { HttpException } from "@/exceptions/HttpException";
import Enrolment from "@/models/course/enrolment/enrolment.model";
import QuestionResponse from "@/models/course/enrolment/questionResponse.model";
import QuizAttempt from "@/models/course/enrolment/quizAttempt.model";
import Question, { EXTENDED_RESPONSE, MULTIPLE_CHOICE } from "@/models/course/quiz/question.model";
import Quiz from "@/models/course/quiz/quiz.model";
import Week from "@/models/course/workloadOverview/week.model";
import User from "@/models/user.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, getUserId, isValidBody } from "@/utils/util";
import { Request, Response } from "express";
import { getKudos } from "../course/getKudosValues.route";
import { completeTask } from "../workloadOverview/completeTask.route";
import { getAttempt } from "./getQuiz.route";

type ResponsePayload = Record<string, never>;

type ResponseInfo = {
    questionId: string;
    choiceId?: Array<string>;
    answer?: string;
};

type QueryPayload = {
    courseId: string;
    quizId: string;
    responses: Array<ResponseInfo>;
};

/**
 * POST /quiz/finish
 * Submits a given quiz for a student
 * @param req
 * @param res
 * @returns
 */
export const finishQuizController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["courseId", "quizId", "responses"];

        // User has been verified
        if (isValidBody<QueryPayload>(req.body, KEYS_TO_CHECK)) {
            // Body has been verified
            const queryBody = req.body;

            await finishQuiz(queryBody, authUser.uid);

            return res.status(200).json({});
        } else {
            throw new HttpException(
                400,
                `Missing body keys: ${getMissingBodyIDs<QueryPayload>(req.body, KEYS_TO_CHECK)}`,
            );
        }
    } catch (error) {
        if (error instanceof HttpException) {
            logger.error(error.getMessage());
            logger.error(error.originalError);
            return res.status(error.getStatusCode()).json({ message: error.getMessage() });
        } else {
            logger.error(error);
            return res.status(500).json({ message: "Internal server error. Error was not caught" });
        }
    }
};

/**
 * Submits a quiz for a student, giving all their answered questions
 *
 * @param queryBody Arguments containing the fields defined above in QueryPayload
 * @param firebase_uid Unique identifier of user
 * @throws { HttpException } Quiz recall failed, save fail, not within quiz open and close times,
 * quiz already attempted
 * answer not given, wrong answer type given
 */
export const finishQuiz = async (queryBody: QueryPayload, firebase_uid: string) => {
    const { courseId, quizId, responses } = queryBody;

    // Create attempt for student
    const user_id = await getUserId(firebase_uid);
    const enrolment = await Enrolment.findOne({ student: user_id, course: courseId });

    if (enrolment === null) {
        throw new HttpException(400, "Student not enrolled in course");
    }

    const attempt = new QuizAttempt({
        quiz: quizId,
        mark: 0,
        responses: [],
    });

    // Get the quiz
    const quiz = await Quiz.findById(quizId).catch((err) => null);

    if (quiz === null) {
        throw new HttpException(400, "Failed to recall quiz");
    }

    // Fail if quiz after due date or quiz not open
    const open = new Date(Date.parse(quiz.open));
    const close = new Date(Date.parse(quiz.close));
    const now = new Date();

    if (now < open) {
        throw new HttpException(400, "Quiz not open yet");
    } else if (now > close) {
        throw new HttpException(400, "Quiz already closed");
    }

    // Fail if quiz already attempted
    if ((await getAttempt(courseId, quizId, firebase_uid)) !== null) {
        throw new HttpException(400, "Quiz already attempted");
    }

    // Go through and mark questions (and do required checks)
    for (const response of responses) {
        // Get question
        const question = await Question.findById(response.questionId)
            .populate({
                path: "choices",
                model: "Choice",
            })
            .catch((err) => null);
        if (question === null) {
            throw new HttpException(400, "Cannot recall question");
        }

        // Verify correct response type
        if (response.answer === undefined && response.choiceId == undefined) {
            throw new HttpException(400, "Must give either response or choice for question");
        } else if (question.type === MULTIPLE_CHOICE && response.choiceId === undefined) {
            throw new HttpException(400, "Must give choice for multiple choice question");
        } else if (question.type === EXTENDED_RESPONSE && response.answer === undefined) {
            throw new HttpException(400, "Must give response for open response question");
        }

        const questionResponse = new QuestionResponse({
            question: question._id,
            marked: false,
            mark: 0,
            choices: [],
        });

        if (question.type === MULTIPLE_CHOICE) {
            questionResponse.marked = true;

            let chosenCorrectly = 0;
            let chosenIncorrectly = 0;
            let notChosenIncorrectly = 0;
            let numCorrect = 0;

            for (const choice of question.choices) {
                if (response.choiceId == null) {
                    continue;
                }
                const isChoiceCorrect: boolean = choice.correct;
                if (isChoiceCorrect && response.choiceId.includes(choice._id.toString())) {
                    chosenCorrectly += 1;
                    numCorrect += 1;
                    questionResponse.choices.push(choice._id);
                } else if (isChoiceCorrect) {
                    numCorrect += 1;
                    notChosenIncorrectly += 1;
                } else if (response.choiceId.includes(choice._id.toString())) {
                    chosenIncorrectly += 1;
                    questionResponse.choices.push(choice._id);
                }
            }

            // Marked as all or nothing
            if (
                chosenCorrectly == numCorrect &&
                notChosenIncorrectly === 0 &&
                chosenIncorrectly === 0
            ) {
                questionResponse.mark = question.marks;
                attempt.mark += question.marks;
            }
        } else {
            questionResponse.answer = response.answer;
        }

        await questionResponse
            .save()
            .then((res) => {
                attempt.responses.push(res._id);
            })
            .catch((err) => {
                logger.error(err);
                throw new HttpException(500, "Failed to save response");
            });
    }

    const attemptId = await attempt
        .save()
        .then((res) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return res._id;
        })
        .catch((err) => {
            logger.error(err);
            throw new HttpException(500, "Failed to save new attempt");
        });

    enrolment.quizAttempts.push(attemptId);

    //Update kudos for user as they have submitted quiz
    const courseKudos = await getKudos(courseId);
    const myStudent = await User.findOne({ _id: user_id })
        .select("_id first_name kudos")
        .exec()
        .catch(() => null);

    if (myStudent === null) throw new HttpException(400, `Student of ${user_id} does not exist`);
    myStudent.kudos = myStudent.kudos + courseKudos.quizCompletion;

    await myStudent.save().catch((err) => {
        throw new HttpException(500, "Failed to add kudos to user", err);
    });

    //Update kudos for the enrolment object for dashboard updates
    enrolment.kudosEarned = enrolment.kudosEarned + courseKudos.quizCompletion;

    await enrolment.save().catch((err) => {
        logger.error(err);
        throw new HttpException(500, "Failed to save updated enrolment");
    });

    if (quiz.task !== undefined) {
        completeQuizTask(myStudent._id, courseId, quiz.task);
    }
};

const completeQuizTask = async (studentId: string, courseId: string, taskId: string) => {
    const week = await Week.findOne({ tasks: { $all: [taskId] } })
        .exec()
        .catch(() => null);

    if (week === null) {
        throw new HttpException(400, "Failed to fetch week");
    }

    const queryPayload = {
        studentId: studentId,
        courseId: courseId,
        weekId: week._id,
        taskId: taskId,
    };
    await completeTask(queryPayload);
};
