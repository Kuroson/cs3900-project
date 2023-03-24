import { HttpException } from "@/exceptions/HttpException";
import Enrolment from "@/models/course/enrolment/enrolment.model";
import QuizAttempt from "@/models/course/enrolment/quizAttempt.model";
import { MULTIPLE_CHOICE } from "@/models/course/quiz/question.model";
import Quiz, { QuizInterfaceFull } from "@/models/course/quiz/quiz.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, getUserId, isValidBody } from "@/utils/util";
import { Request, Response } from "express";
import { checkAdmin } from "../admin/admin.route";

type ChoiceInfo = {
    text: string;
    correct?: boolean;
    chosen: boolean;
};

type QuestionInfo = {
    text: string;
    type: string;
    markAwarded?: number;
    markTotal: number;
    tag: string;
    response?: string;
    choices?: Array<ChoiceInfo>;
};

type ResponsePayload = {
    title: string;
    description: string;
    maxMarks: number;
    marksAwarded?: number;
    open: string;
    close: string;
    questions?: Array<QuestionInfo>;
};

type QueryPayload = {
    courseId: string;
    quizId: string;
};

/**
 * GET /quiz
 * Gets all the quiz details for the student
 * @param req
 * @param res
 * @returns
 */
export const getQuizController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["courseId", "quizId"];

        // User has been verified
        if (isValidBody<QueryPayload>(req.query, KEYS_TO_CHECK)) {
            // Body has been verified
            const queryBody = req.query;

            const ret_data = await getQuiz(queryBody, authUser.uid);

            return res.status(200).json(ret_data);
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
 * Gets all the quiz info for the student. The information returned varies based on the
 * current student's state regarding the quiz. If the student has not completed the quiz,
 * it will not include questions. If the student has completed the quiz it will include the
 * question and responses. If it is after the due date, the correct answers will be displayed.
 * Extended responses will only show mark awarded after they have been marked.
 *
 * @param queryBody Arguments containing the fields defined above in QueryPayload
 * @param firebase_uid Unique identifier of user
 * @throws { HttpException } Recall failed
 * @returns Object of quiz information
 */
export const getQuiz = async (queryBody: QueryPayload, firebase_uid: string) => {
    const { courseId, quizId } = queryBody;

    const quiz = await Quiz.findById(quizId)
        .populate({
            path: "questions",
            model: "Question",
            populate: {
                path: "choices",
                model: "Choice",
            },
        })
        .catch((err) => {
            logger.error(err);
            throw new HttpException(500, "Failed to recall quiz");
        });
    if (quiz === null) {
        throw new HttpException(500, "Failed to recall quiz");
    }

    const ret_data: ResponsePayload = {
        title: quiz.title,
        description: quiz.description !== undefined ? quiz.description : "",
        maxMarks: quiz.maxMarks,
        open: quiz.open,
        close: quiz.close,
    };

    // Get attempt
    const attemptId = await getAttempt(courseId, quizId, firebase_uid);

    // Only return base information if not attempted
    if (attemptId === null) {
        return ret_data;
    }

    const now = new Date();
    const close = new Date(Date.parse(quiz.close));
    const afterDue = now > close;

    // Add questions and responses
    let marksAwarded = 0;
    let marksTotal = 0;
    for (const question of quiz.questions) {
        const questionResponse = await getQuestionResponse(question._id, attemptId);

        const questionInfo: QuestionInfo = {
            text: question.text,
            type: question.type,
            markTotal: question.marks,
            tag: question.tag,
        };

        // Responses and choices varies based on type of question
        if (question.type === MULTIPLE_CHOICE) {
            questionInfo.choices = [];
            for (const choice of question.choices) {
                const choiceInfo: ChoiceInfo = {
                    text: choice.text,
                    chosen: choice._id.equals(questionResponse.choice),
                };

                if (afterDue) {
                    choiceInfo.correct = choice.correct;
                    questionInfo.markAwarded = questionResponse.mark;
                }

                questionInfo.choices.push(choiceInfo);
            }
        } else {
            questionInfo.response = questionResponse.answer;

            if (afterDue && questionResponse.marked) {
                questionInfo.markAwarded = questionResponse.mark;
            }
        }

        marksAwarded += questionResponse.mark;
        marksTotal += question.marks;

        if (ret_data.questions === undefined) {
            ret_data.questions = [];
        }
        ret_data.questions.push(questionInfo);
    }

    if (afterDue) {
        ret_data.marksAwarded = (marksAwarded / marksTotal) * quiz.maxMarks;
    }

    return ret_data;
};

export const getAttempt = async (courseId: string, quizId: string, firebase_uid: string) => {
    // Get enrolment
    const enrolment = await Enrolment.findOne({
        course: courseId,
        student: await getUserId(firebase_uid),
    })
        .populate({
            path: "quizAttempts",
            model: "QuizAttempt",
            select: "_id quiz",
        })
        .catch((err) => {
            logger.error(err);
            throw new HttpException(500, "Failed to fetch enrolment");
        });
    if (enrolment === null) {
        throw new HttpException(500, "Failed to fetch enrolment");
    }

    for (const attempt of enrolment.quizAttempts) {
        if (attempt.quiz.equals(quizId)) {
            return attempt._id;
        }
    }
    return null;
};

const getQuestionResponse = async (questionId: string, attemptId: string) => {
    const attempt = await QuizAttempt.findById(attemptId)
        .populate({
            path: "responses",
            model: "QuestionResponse",
        })
        .catch((err) => {
            logger.error(err);
            throw new HttpException(500, "Failed to fetch attempt");
        });
    if (attempt === null) {
        throw new HttpException(500, "Failed to fetch attempt");
    }

    for (const question of attempt.responses) {
        if (question.question.equals(questionId)) {
            return question;
        }
    }
    throw new HttpException(500, "Question response not present");
};
