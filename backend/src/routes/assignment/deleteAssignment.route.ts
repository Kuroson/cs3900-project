import { HttpException } from "@/exceptions/HttpException";
import Assignment from "@/models/course/assignment/assignment.model";
import Course from "@/models/course/course.model";
import Task from "@/models/course/workloadOverview/Task.model";
import Week from "@/models/course/workloadOverview/week.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";
import { checkAdmin } from "../admin/admin.route";
import { deleteTask } from "../workloadOverview/deleteTask.route";

type ResponsePayload = Record<string, never>;

type QueryPayload = {
    courseId: string;
    assignmentId: string;
};

/**
 * DELETE /assignment/delete
 * Deletes the given assignment
 * @param req
 * @param res
 * @returns
 */
export const deleteAssignmentController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["courseId", "assignmentId"];

        // User has been verified
        if (isValidBody<QueryPayload>(req.body, KEYS_TO_CHECK)) {
            // Body has been verified
            const queryBody = req.body;

            await deleteAssignment(queryBody, authUser.uid);

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
 * Deletes the given assignment from the given course
 *
 * @param queryBody Arguments containing the fields defined above in QueryPayload
 * @param firebase_uid Unique identifier of user
 * @throws { HttpException } Save/recall failed
 */
export const deleteAssignment = async (queryBody: QueryPayload, firebase_uid: string) => {
    if (!(await checkAdmin(firebase_uid))) {
        throw new HttpException(401, "Must be an admin to delete assignment");
    }

    const { courseId, assignmentId } = queryBody;

    const course = await Course.findById(courseId)
        .exec()
        .catch((err) => null);
    if (course === null) {
        throw new HttpException(400, "Failed to fetch course");
    }
    await deleteAssignmentTask(assignmentId, firebase_uid);

    course.assignments.pull(assignmentId);

    await Assignment.findByIdAndDelete(assignmentId).catch((err) => {
        logger.error(err);
        throw new HttpException(500, "Failed to delete assignment");
    });

    await course.save().catch((err) => {
        logger.error(err);
        throw new HttpException(400, "Failed to save updated course");
    });
};

const deleteAssignmentTask = async (assignmentId: string, firebase_uid: string) => {
    //gets assignment
    const assignment = await Assignment.findById(assignmentId).catch((err) => null);
    if (assignment === null) {
        throw new HttpException(400, "Failed to recall assignment");
    }

    // deletes task if a task exists
    if (assignment.task !== undefined) {
        // Get the week
        // delete task
        const week = await Week.findOne({ tasks: { $all: [assignment.task] } })
            .exec()
            .catch(() => null);

        if (week === null) {
            throw new HttpException(400, "Failed to fetch week");
        }

        const queryPayload = { weekId: week._id, taskId: assignment.task };

        await deleteTask(queryPayload, firebase_uid);
    }
};
