import { HttpException } from "@/exceptions/HttpException";
import Task from "@/models/course/workloadOverview/Task.model";
import Week from "@/models/course/workloadOverview/week.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";
import { checkAdmin } from "../admin/admin.route";

type ResponsePayload = Record<string, never>;

type QueryPayload = {
    weekId: string;
    taskId: string;
};

/**
 * DELETE /workload/task/delete
 * @param req
 * @param res
 * @returns
 */
export const deleteTaskController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["weekId", "taskId"];

        // User has been verified
        if (isValidBody<QueryPayload>(req.body, KEYS_TO_CHECK)) {
            // Body has been verified
            const queryBody = req.body;

            await deleteTask(queryBody, authUser.uid);

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
 * Deletes the supplied task from the database
 * @param queryBody
 * @param firebase_uid
 */
export const deleteTask = async (queryBody: QueryPayload, firebase_uid: string) => {
    if (!(await checkAdmin(firebase_uid))) {
        throw new HttpException(401, "Must be an admin to delete task");
    }

    const { weekId, taskId } = queryBody;

    // Get Week
    const week = await Week.findById(weekId)
        .exec()
        .catch((err) => {
            logger.error(err);
            throw new HttpException(500, "Failed to fetch week", err);
        });

    if (week === null) {
        throw new HttpException(400, "Failed to fetch week");
    }

    // Does the task exist within the week
    if (!week.tasks.includes(taskId)) {
        throw new HttpException(400, "Failed to delete Task. Task not within provided Week");
    }

    // Delete task
    await Task.findByIdAndDelete(taskId).catch((err) => {
        logger.error(err);
        throw new HttpException(500, "Failed to delete Task from Database", err);
    });

    // Remove taskId from the week
    week.tasks.pull(taskId);

    // Save the updated weel
    await week.save().catch((err) => {
        logger.error(err);
        throw new HttpException(500, "Failed to save updated week", err);
    });
};
