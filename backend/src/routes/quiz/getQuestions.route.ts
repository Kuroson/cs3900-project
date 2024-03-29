import { Request, Response } from "express";
import { HttpException } from "@/exceptions/HttpException";
import Quiz, { QuizInterfaceFull } from "@/models/course/quiz/quiz.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { checkAdmin } from "../admin/admin.route";

type ResponsePayload = QuizInterfaceFull;

type QueryPayload = {
    quizId: string;
};

/**
 * GET /quiz/questions
 * Gets a list of all questions in the quiz
 * @param req
 * @param res
 * @returns
 */
export const getQuestionsController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["quizId"];

        // User has been verified
        if (isValidBody<QueryPayload>(req.query, KEYS_TO_CHECK)) {
            // Body has been verified
            const queryBody = req.query;

            const ret_data = await getQuestions(queryBody, authUser.uid);

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
 * Gets all the questions in the given quiz for the admin, including all the denoted info
 *
 * @param queryBody Arguments containing the fields defined above in QueryPayload
 * @param firebase_uid Unique identifier of user
 * @throws { HttpException } Course recall failed
 * @returns The list of questions with the required information
 */
export const getQuestions = async (queryBody: QueryPayload, firebase_uid: string) => {
    if (!(await checkAdmin(firebase_uid))) {
        throw new HttpException(401, "Must be an admin to get full quiz info");
    }

    const { quizId } = queryBody;

    const quiz = await Quiz.findById(quizId)
        .populate({
            path: "questions",
            model: "Question",
            populate: {
                path: "choices",
                model: "Choice",
            },
        })
        .catch((err) => null);

    if (quiz === null) {
        throw new HttpException(400, "Failed to recall quiz");
    }

    return quiz;
};
