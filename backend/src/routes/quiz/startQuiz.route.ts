import { HttpException } from "@/exceptions/HttpException";
import Quiz, { QuizInterfaceStudent } from "@/models/course/quiz/quiz.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, getUserId, isValidBody } from "@/utils/util";
import { Request, Response } from "express";
import { checkAdmin } from "../admin/admin.route";
import { getAttempt } from "./getQuiz.route";

type ResponsePayload = QuizInterfaceStudent;

type QueryPayload = {
    courseId: string;
    quizId: string;
};

/**
 * GET /quiz/start
 * Starts the quiz for a student, getting the questions
 * @param req
 * @param res
 * @returns
 */
export const startQuizController = async (
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

            const ret_data = await startQuiz(queryBody, authUser.uid);

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
 * Starts the quiz for the student, giving back a view of all the questions in the quiz. This
 * has all the answer information emitted.
 *
 * @param queryBody Arguments containing the fields defined above in QueryPayload
 * @param firebase_uid Unique identifier of user
 * @throws { HttpException } Quiz recall failed, save fail, not within quiz open and close times,
 * quiz already attempted
 * @returns Information about the given quiz
 */
export const startQuiz = async (queryBody: QueryPayload, firebase_uid: string) => {
    if (!(await checkAdmin(firebase_uid))) {
        throw new HttpException(401, "Must be an admin to get all courses");
    }

    const { quizId, courseId } = queryBody;

    // Fail if quiz already attempted
    if (await getAttempt(courseId, quizId, firebase_uid)) {
        throw new HttpException(400, "Quiz already attempted");
    }

    // Get the quiz with subset of fields
    const quiz = await Quiz.findById(quizId).populate({
        path: "questions",
        model: "Question",
        select: "_id text type marks choices",
        populate: {
            path: "choices",
            model: "Choice",
            select: "text",
        },
    });

    if (quiz === null) {
        throw new HttpException(500, "Failed to recall quiz");
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

    return quiz;
};
