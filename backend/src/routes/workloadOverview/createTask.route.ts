import { HttpException } from "@/exceptions/HttpException";
import Task from "@/models/course/workloadOverview/Task.model";
import Week from "@/models/course/workloadOverview/week.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";
import { checkAdmin } from "../admin/admin.route";

type ResponsePayload = {
    taskId: string;
};

type QueryPayload = {
    weekId: string;
    title: string;
    description: string;
};

/**
 * POST  /workload/task/create
 * Creates a new task within a given week
 * @param req
 * @param res
 * @returns
 */
export const createTaskController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["weekId", "title", "description"];

        // User has been verified
        if (isValidBody<QueryPayload>(req.body, KEYS_TO_CHECK)) {
            // Body has been verified
            const { weekId, title, description } = req.body;

            const taskId = await createTask(weekId, title, description, authUser.uid);

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
            return res.status(error.getStatusCode()).json({ message: error.getMessage() });
        } else {
            logger.error(error);
            return res.status(500).json({ message: "Internal server error. Error was not caught" });
        }
    }
};

/**
 * Creates a new task in a given week with the information provided
 * @param weekId
 * @param title
 * @param description
 */
export const createTask = async (
    weekId: string,
    title: string,
    description: string,
    firebase_uid: string,
): Promise<string> => {
    if (!(await checkAdmin(firebase_uid))) {
        throw new HttpException(403, "Must be an admin to create a task");
    }

    const week = await Week.findById(weekId).catch((err) => {
        throw new HttpException(400, `Week, ${weekId}, does not exist`);
    });

    const newTask = new Task({
        title: title,
        description: description,
    });

    const taskId = await newTask
        .save()
        .then((res) => {
            return res._id;
        })
        .catch((err) => {
            throw new HttpException(500, "Failed to create task", err);
        });

    //Add task to the week
    week?.tasks.push(taskId);

    await week?.save().catch((err) => {
        throw new HttpException(500, "Failed to add task to week", err);
    });

    return taskId;
};
