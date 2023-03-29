import { HttpException } from "@/exceptions/HttpException";
import Task from "@/models/course/workloadOverview/Task.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";
import { checkAdmin } from "../admin/admin.route";

type ResponsePayload = {
    taskId: string;
};

type QueryPayload = {
    taskId: string;
    title?: string;
    description?: string;
};

/**
 * PUT /workload/task/update
 * Updates a task
 * @param req
 * @param res
 * @returns
 */
export const updateTaskController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["taskId"];

        // User has been verified
        if (isValidBody<QueryPayload>(req.body, KEYS_TO_CHECK)) {
            // Body has been verified
            const queryBody = req.body;

            const taskId = await updateTask(queryBody, authUser.uid);

            logger.info(`taskId: ${taskId}`);
            return res.status(200).json({ taskId });
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
 * Updates an existing task with the parameters given
 * @param queryBody
 * @param firebase_uid
 * @returns
 */
export const updateTask = async (queryBody: QueryPayload, firebase_uid: string) => {
    if (!(await checkAdmin(firebase_uid))) {
        throw new HttpException(401, "Must be an admin to update tasks");
    }

    const { taskId, title, description } = queryBody;

    const task = await Task.findById(taskId)
        .exec()
        .catch((err) => {
            logger.error(err);
            throw new HttpException(500, "Failed to fetch task");
        });

    if (task === null) {
        throw new HttpException(500, "Failed to fetch task");
    }

    if (title !== undefined) {
        task.title = title;
    }
    if (description !== undefined) {
        task.description = description;
    }

    const myTask = await task.save().catch((err) => {
        logger.error(err);
        throw new HttpException(500, "Failed to save updated task");
    });

    return myTask._id;
};
