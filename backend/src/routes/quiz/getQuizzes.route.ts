import { Request, Response } from "express";
import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course/course.model";
import Enrolment from "@/models/course/enrolment/enrolment.model";
import User from "@/models/user.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { checkAdmin } from "../admin/admin.route";

type QuizInfo = {
    quizId: string;
    title: string;
    isResponded?: boolean;
    open: string;
    close: string;
    task?: string;
};

type ResponsePayload = {
    quizzes: Array<QuizInfo>;
};

type QueryPayload = {
    courseId: string;
};

/**
 * GET /quiz/list
 * Gets a list of all quizzes in the course
 * @param req
 * @param res
 * @returns
 */
export const getQuizzesController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["courseId"];

        // User has been verified
        if (isValidBody<QueryPayload>(req.query, KEYS_TO_CHECK)) {
            // Body has been verified
            const queryBody = req.query;

            const quizzes = await getQuizzes(queryBody, authUser.uid);

            logger.info(`quizzes: ${quizzes}`);
            return res.status(200).json({ quizzes });
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
 * Gets a list of all quizzes in the course with their basic information
 *
 * @param queryBody Arguments containing the fields defined above in QueryPayload
 * @param firebase_uid Unique identifier of user
 * @throws { HttpException } Course recall failed
 * @returns The list of quizzes with the required information
 */
export const getQuizzes = async (queryBody: QueryPayload, firebase_uid: string) => {
    const { courseId } = queryBody;

    const course = await Course.findById(courseId)
        .populate({
            path: "quizzes",
            model: "Quiz",
        })
        .exec()
        .catch((err) => null);

    if (course === null) {
        throw new HttpException(400, "Failed to fetch course");
    }

    const quizzes: Array<QuizInfo> = [];

    for (const quiz of course.quizzes) {
        const isAdmin = await checkAdmin(firebase_uid);

        const user = await User.findOne({ firebase_uid }).catch((err) => null);

        if (user === null) {
            throw new HttpException(400, "Failed to fetch user");
        }

        const quizInfo: QuizInfo = {
            quizId: quiz._id,
            title: quiz.title,
            open: quiz.open,
            close: quiz.close,
            task: quiz.task,
        };

        if (!isAdmin) {
            // Get student enrolment and see if they have completed the quiz
            const enrolment = await Enrolment.findOne({
                student: user._id,
                course: courseId,
            })
                .populate({
                    path: "quizAttempts",
                    model: "QuizAttempt",
                })
                .catch((err) => null);

            if (enrolment === null) {
                throw new HttpException(400, "Failed to fetch enrolment");
            }

            quizInfo.isResponded = enrolment.quizAttempts.some((attempt) => {
                return attempt.quiz._id.equals(quiz._id);
            });
        }

        quizzes.push(quizInfo);
    }

    return quizzes;
};
