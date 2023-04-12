import { HttpException } from "@/exceptions/HttpException";
import Assignment from "@/models/course/assignment/assignment.model";
import OnlineClass from "@/models/course/onlineClass/onlineClass.model";
import Task from "@/models/course/workloadOverview/Task.model";
import Week from "@/models/course/workloadOverview/week.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";
import { checkAdmin } from "../admin/admin.route";
import { updateQuiz } from "../quiz/updateQuiz.route";

type ResponsePayload = {
    taskId: string;
};

type QueryPayload = {
    weekId: string;
    title: string;
    description: string;
    quizId?: string;
    assignmentId?: string;
    onlineClassId?: string;
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
            const taskId = await createTask(req.body, authUser.uid);

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
    queryBody: QueryPayload,
    firebase_uid: string,
): Promise<string> => {
    if (!(await checkAdmin(firebase_uid))) {
        throw new HttpException(403, "Must be an admin to create a task");
    }

    const { weekId, title, description, quizId, assignmentId, onlineClassId } = queryBody;

    const week = await Week.findById(weekId).catch(() => null);

    if (week === null) {
        throw new HttpException(400, `Week, ${weekId}, does not exist`);
    }

    let newTask;

    if (quizId !== undefined) {
        newTask = new Task({
            title: title,
            description: description,
            quiz: quizId,
        });

        await updateQuiz({ quizId: quizId, task: newTask._id }, firebase_uid);
    } else if (assignmentId !== undefined) {
        newTask = new Task({
            title: title,
            description: description,
            assignment: assignmentId,
        });

        const assignment = await Assignment.findById(assignmentId)
            .exec()
            .catch(() => null);
        if (assignment === null) {
            throw new HttpException(400, "Failed to fetch assignment");
        }
        assignment.task = newTask._id;
        await assignment.save().catch((err) => {
            logger.error(err);
            throw new HttpException(500, "Failed to save new assignment");
        });
    } else if (onlineClassId !== undefined) {
        newTask = new Task({
            title: title,
            description: description,
            onlineClass: onlineClassId,
        });

        const onlineClass = await OnlineClass.findById(onlineClassId)
            .exec()
            .catch(() => null);
        if (onlineClass === null) {
            throw new HttpException(400, "Failed to fetch Online Class");
        }
        onlineClass.task = newTask._id;
        await onlineClass.save().catch((err) => {
            logger.error(err);
            throw new HttpException(500, "Failed to save updated OnlineClass");
        });
    } else {
        newTask = new Task({
            title: title,
            description: description,
        });
    }

    const taskId = await newTask
        .save()
        .then((res) => {
            return res._id;
        })
        .catch((err) => {
            throw new HttpException(500, "4ailed to create task", err);
        });

    //Add task to the week
    week?.tasks.push(taskId);

    await week?.save().catch((err) => {
        throw new HttpException(500, "Failed to add task to week", err);
    });

    return taskId.toString();
};
