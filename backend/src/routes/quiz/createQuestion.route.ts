import { Request, Response } from "express";
import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course/course.model";
import Choice from "@/models/course/quiz/choice.model";
import Question from "@/models/course/quiz/question.model";
import Quiz from "@/models/course/quiz/quiz.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { checkAdmin } from "../admin/admin.route";

type ResponsePayload = {
    questionId: string;
};

type QuizChoice = {
    text: string;
    correct: boolean;
};

type QueryPayload = {
    courseId: string;
    quizId: string;
    text: string;
    type: string;
    marks: number;
    choices?: Array<QuizChoice>;
    tag: string;
};

/**
 * PUT /quiz/question/create
 * Creates a new question in a quiz
 * @param req
 * @param res
 * @returns
 */
export const createQuestionController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = [
            "courseId",
            "quizId",
            "text",
            "type",
            "marks",
            "tag",
        ];

        // User has been verified
        if (isValidBody<QueryPayload>(req.body, KEYS_TO_CHECK)) {
            // Body has been verified
            const queryBody = req.body;

            const questionId = await createQuestion(queryBody, authUser.uid);

            logger.info(`questionId: ${questionId}`);
            return res.status(200).json({ questionId });
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
 * Adds a question with the given information to the couse
 *
 * @param queryBody Arguments containing the fields defined above in QueryPayload
 * @param firebase_uid Unique identifier of user
 * @throws { HttpException } User not admin, quiz recall failed, save error, tag not
 * in course tags, invalid question type, choices not given for multiple choice questions
 * @returns The ID of the question that has been created
 */
export const createQuestion = async (queryBody: QueryPayload, firebase_uid: string) => {
    if (!(await checkAdmin(firebase_uid))) {
        throw new HttpException(401, "Must be an admin to create question");
    }

    const { courseId, quizId, text, type, marks, choices, tag } = queryBody;

    // Check mark valid
    if (marks < 0) {
        throw new HttpException(400, "Mark must be positive");
    }

    // Get course tags
    const course = await Course.findById(courseId).catch((err) => null);
    if (course === null) {
        throw new HttpException(400, "Failed to recall course");
    }

    if (!course.tags.includes(tag)) {
        throw new HttpException(400, "Tag not in course tags");
    }

    // Check type is valid
    if (!["choice", "open"].includes(type)) {
        throw new HttpException(400, "Invalid question type");
    }

    // Choices must be given for multiple choice question
    if (type === "choice" && choices === undefined) {
        throw new HttpException(400, "Choices must be given for multiple choice questions");
    }

    const quiz = await Quiz.findById(quizId)
        .exec()
        .catch((err) => null);

    if (quiz === null) {
        throw new HttpException(400, "Failed to fetch quiz");
    }

    const myQuestion = new Question({
        text,
        type: type,
        marks,
        choices: [],
        tag,
    });

    if (type === "choice" && choices !== undefined) {
        for (const choice of choices) {
            const myChoice = await new Choice({
                text: choice.text,
                correct: choice.correct,
            })
                .save()
                .catch((err) => null);

            if (myChoice === null) {
                throw new HttpException(500, "Failed to save choice");
            }

            myQuestion.choices.push(myChoice._id);
        }
    }

    await myQuestion.save().catch((err) => {
        logger.error(err);
        throw new HttpException(500, "Failed to save question");
    });

    quiz.questions.push(myQuestion._id);

    await quiz.save().catch((err) => {
        logger.error(err);
        throw new HttpException(500, "Failed to save update quiz");
    });

    return myQuestion._id.toString() as string;
};
