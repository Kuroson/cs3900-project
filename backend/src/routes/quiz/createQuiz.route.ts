import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course/course.model";
import Quiz from "@/models/course/quiz/quiz.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";
import { checkAdmin } from "../admin/admin.route";

type ResponsePayload = {
    quizId: string;
};

type QueryPayload = {
    courseId: string;
    title: string;
    description: string;
    maxMarks: number;
    open: string;
    close: string;
};

/**
 * POST /quiz/create
 * Creates a quiz
 * @param req
 * @param res
 * @returns
 */
export const createQuizController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = [
            "courseId",
            "title",
            "description",
            "maxMarks",
            "open",
            "close",
        ];

        // User has been verified
        if (isValidBody<QueryPayload>(req.body, KEYS_TO_CHECK)) {
            // Body has been verified
            const queryBody = req.body;

            const quizId = await createQuiz(queryBody, authUser.uid);

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
 * Creates a new quiz with the parameters given.
 *
 * @param queryBody Arguments containing the fields defined above in QueryPayload
 * @param firebase_uid Unique identifier of user
 * @throws { HttpException } Save error, course not available
 * @returns The ID of the quiz that has been created
 */
export const createQuiz = async (queryBody: QueryPayload, firebase_uid: string) => {
    if (!(await checkAdmin(firebase_uid))) {
        throw new HttpException(401, "Must be an admin to create quiz");
    }

    const { courseId, title, description, maxMarks, open, close } = queryBody;

    const course = await Course.findById(courseId)
        .exec()
        .catch((err) => {
            logger.error(err);
            throw new HttpException(500, "Failed to fetch course");
        });

    if (course === null) {
        throw new HttpException(500, "Failed to fetch course");
    }

    const myQuiz = await new Quiz({
        title,
        description,
        open,
        close,
        maxMarks,
        quesions: [],
    })
        .save()
        .catch((err) => {
            logger.error(err);
            throw new HttpException(500, "Failed to save new quiz");
        });

    course.quizzes.push(myQuiz._id);

    await course.save().catch((err) => {
        logger.error(err);
        throw new HttpException(500, "Failed to save updated course");
    });

    return myQuiz._id;
};
