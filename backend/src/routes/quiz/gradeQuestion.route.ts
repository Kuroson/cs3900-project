import { Request, Response } from "express";
import { HttpException } from "@/exceptions/HttpException";
import QuestionResponse from "@/models/course/enrolment/questionResponse.model";
import Question from "@/models/course/quiz/question.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { checkAdmin } from "../admin/admin.route";

type ResponsePayload = Record<string, never>;

type QueryPayload = {
    questionId: string;
    responseId: string;
    mark: number;
};

/**
 * POST /quiz/question/grade
 * Grade a given question
 * @param req
 * @param res
 * @returns
 */
export const gradeQuestionController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["questionId", "responseId", "mark"];

        // User has been verified
        if (isValidBody<QueryPayload>(req.body, KEYS_TO_CHECK)) {
            // Body has been verified
            const queryBody = req.body;

            await gradeQuestion(queryBody, authUser.uid);

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
 * Grades a given question within a quiz
 *
 * @param queryBody Arguments containing the fields defined above in QueryPayload
 * @param firebase_uid Unique identifier of user
 * @throws { HttpException } Recall/save error, mark above question max
 */
export const gradeQuestion = async (queryBody: QueryPayload, firebase_uid: string) => {
    if (!(await checkAdmin(firebase_uid))) {
        throw new HttpException(401, "Must be an admin to create quiz");
    }

    const { questionId, responseId, mark } = queryBody;

    const response = await QuestionResponse.findById(responseId).catch((err) => {
        logger.error(err);
        throw new HttpException(400, "Failed to recall response");
    });
    if (response === null) {
        throw new HttpException(400, "Failed to recall response");
    }

    const question = await Question.findById(questionId).catch((err) => {
        logger.error(err);
        throw new HttpException(400, "Failed to recall response");
    });
    if (question === null) {
        throw new HttpException(400, "Failed to recall response");
    }

    if (mark < 0 || mark > question.marks) {
        throw new HttpException(400, "Cannot award more than maximum mark");
    }

    response.marked = true;
    response.mark = mark;

    await response.save().catch((err) => {
        logger.error(err);
        throw new HttpException(500, "Failed to save updated response");
    });
};
