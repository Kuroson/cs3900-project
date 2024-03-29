import { Request, Response } from "express";
import { HttpException } from "@/exceptions/HttpException";
import Quiz from "@/models/course/quiz/quiz.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { checkAdmin } from "../admin/admin.route";

type ResponsePayload = {
    quizId: string;
};

type QueryPayload = {
    quizId: string;
    title?: string;
    description?: string;
    maxMarks?: number;
    open?: string;
    close?: string;
    task?: string;
};

/**
 * PUT /quiz/update
 * Updates a quiz
 * @param req
 * @param res
 * @returns
 */
export const updateQuizController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["quizId"];

        // User has been verified
        if (isValidBody<QueryPayload>(req.body, KEYS_TO_CHECK)) {
            // Body has been verified
            const queryBody = req.body;

            const quizId = await updateQuiz(queryBody, authUser.uid);

            logger.info(`quizId: ${quizId}`);
            return res.status(200).json({ quizId });
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
 * Updates an existing quiz with the new parameters given.
 *
 * @param queryBody Arguments containing the fields defined above in QueryPayload
 * @param firebase_uid Unique identifier of user
 * @throws { HttpException } Quiz recall failed, save error
 * @returns The ID of the quiz that has been updated
 */
export const updateQuiz = async (queryBody: QueryPayload, firebase_uid: string) => {
    if (!(await checkAdmin(firebase_uid))) {
        throw new HttpException(401, "Must be an admin to update quiz");
    }

    const { quizId, title, description, maxMarks, open, close, task } = queryBody;

    const quiz = await Quiz.findById(quizId)
        .exec()
        .catch((err) => null);

    if (quiz === null) {
        throw new HttpException(400, "Failed to recall quiz");
    }

    if (title !== undefined) {
        quiz.title = title;
    }

    if (description !== undefined) {
        quiz.description = description;
    }

    if (maxMarks !== undefined) {
        // Check mark valid
        if (maxMarks < 0) {
            throw new HttpException(400, "Mark must be positive");
        }

        quiz.maxMarks = maxMarks;
    }

    if (open !== undefined) {
        quiz.open = open;
    }

    if (close !== undefined) {
        quiz.close = close;
    }

    if (quiz.task !== undefined && task !== undefined) {
        throw new HttpException(400, "Quiz is already an assigned task");
    } else if (task !== undefined) {
        quiz.task = task;
    }

    const myQuiz = await quiz.save().catch((err) => {
        logger.error(err);
        throw new HttpException(500, "Failed to save updated quiz");
    });

    return myQuiz._id.toString() as string;
};
