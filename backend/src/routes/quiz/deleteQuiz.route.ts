import { Request, Response } from "express";
import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course/course.model";
import Quiz from "@/models/course/quiz/quiz.model";
import Week from "@/models/course/workloadOverview/week.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { checkAdmin } from "../admin/admin.route";
import { deleteTask } from "../workloadOverview/deleteTask.route";

type ResponsePayload = Record<string, never>;

type QueryPayload = {
    courseId: string;
    quizId: string;
};

/**
 * DELETE /quiz/delete
 * Deletes a quiz from a course
 * @param req
 * @param res
 * @returns
 */
export const deleteQuizController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["courseId", "quizId"];

        // User has been verified
        if (isValidBody<QueryPayload>(req.body, KEYS_TO_CHECK)) {
            // Body has been verified
            const queryBody = req.body;

            await deleteQuiz(queryBody, authUser.uid);

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
 * Deletes the given quiz from the given course.
 *
 * @param queryBody Arguments containing the fields defined above in QueryPayload
 * @param firebase_uid Unique identifier of user
 * @throws { HttpException } User not admin, recall/save failed
 */
export const deleteQuiz = async (queryBody: QueryPayload, firebase_uid: string) => {
    if (!(await checkAdmin(firebase_uid))) {
        throw new HttpException(401, "Must be an admin to delete quiz");
    }

    const { courseId, quizId } = queryBody;

    // Get course
    const course = await Course.findById(courseId)
        .exec()
        .catch((err) => null);

    if (course === null) {
        throw new HttpException(400, "Failed to fetch course");
    }

    // delete Quiz
    await deleteQuizTask(quizId, firebase_uid);

    course.quizzes.pull(quizId);

    await Quiz.findByIdAndDelete(quizId).catch((err) => {
        logger.error(err);
        throw new HttpException(500, "Failed to delete question");
    });

    await course.save().catch((err) => {
        logger.error(err);
        throw new HttpException(500, "Failed to save updated course");
    });
};

const deleteQuizTask = async (quizId: string, firebase_uid: string) => {
    //gets assignment
    const quiz = await Quiz.findById(quizId).catch((err) => null);
    if (quiz === null) {
        throw new HttpException(400, "Failed to recall quiz");
    }

    // deletes task if a task exists
    if (quiz.task !== undefined) {
        // Get the week
        // delete task
        const week = await Week.findOne({ tasks: { $all: [quiz.task] } })
            .exec()
            .catch(() => null);

        if (week === null) {
            throw new HttpException(400, "Failed to fetch week");
        }

        const queryPayload = { weekId: week._id, taskId: quiz.task };

        await deleteTask(queryPayload, firebase_uid);
    }
};
