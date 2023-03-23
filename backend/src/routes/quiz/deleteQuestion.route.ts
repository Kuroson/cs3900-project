import { HttpException } from "@/exceptions/HttpException";
import Question from "@/models/course/quiz/question.model";
import Quiz from "@/models/course/quiz/quiz.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";
import { checkAdmin } from "../admin/admin.route";

type ResponsePayload = Record<string, never>;

type QueryPayload = {
    quizId: string;
    questionId: string;
};

/**
 * DELETE /quiz/question/delete
 * Deletes a question from a quiz
 * @param req
 * @param res
 * @returns
 */
export const deleteQuestionController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["quizId", "questionId"];

        // User has been verified
        if (isValidBody<QueryPayload>(req.body, KEYS_TO_CHECK)) {
            // Body has been verified
            const queryBody = req.body;

            await deleteQuestion(queryBody, authUser.uid);

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
 * Deletes the given question from the given quiz. Deleting both the question from the quiz
 * and the question itself from the database.
 *
 * @param queryBody Arguments containing the fields defined above in QueryPayload
 * @param firebase_uid Unique identifier of user
 * @throws { HttpException } User not admin, quiz/question recall failed, save error
 */
export const deleteQuestion = async (queryBody: QueryPayload, firebase_uid: string) => {
    if (!(await checkAdmin(firebase_uid))) {
        throw new HttpException(401, "Must be an admin to get all courses");
    }

    const { quizId, questionId } = queryBody;

    // Get quiz
    const quiz = await Quiz.findById(quizId)
        .exec()
        .catch((err) => {
            logger.error(err);
            throw new HttpException(500, "Failed to fetch quiz");
        });

    if (quiz === null) {
        throw new HttpException(500, "Failed to fetch quiz");
    }

    quiz.questions.pull(questionId);

    await Question.findByIdAndDelete(questionId).catch((err) => {
        logger.error(err);
        throw new HttpException(500, "Failed to delete question");
    });

    await quiz.save().catch((err) => {
        logger.error(err);
        throw new HttpException(500, "Failed to save update quiz");
    });
};
