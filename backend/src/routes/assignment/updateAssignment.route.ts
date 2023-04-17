import { Request, Response } from "express";
import { Types } from "mongoose";
import { HttpException } from "@/exceptions/HttpException";
import Assignment from "@/models/course/assignment/assignment.model";
import Course from "@/models/course/course.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { checkAdmin } from "../admin/admin.route";

type ResponsePayload = {
    assignmentId: string;
};

type QueryPayload = {
    courseId: string;
    assignmentId: string;
    title?: string;
    description?: string;
    deadline?: string;
    marksAvailable?: number;
    tags?: Array<string>;
    task?: string;
};

/**
 * PUT /assignment/update
 * Updates an existing assignment
 * @param req
 * @param res
 * @returns
 */
export const updateAssignmentController = async (
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

            const assignmentId = await updateAssignment(queryBody, authUser.uid);

            logger.info(`assignmentId: ${assignmentId}`);
            return res.status(200).json({ assignmentId });
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
 * Updates information within an existing assignment with the parameters given.
 *
 * @param queryBody Arguments containing the fields defined above in QueryPayload
 * @param firebase_uid Unique identifier of user
 * @throws { HttpException } Recall/save error, tags not in course
 * @returns The ID of the assignment that has been updated
 */
export const updateAssignment = async (queryBody: QueryPayload, firebase_uid: string) => {
    if (!(await checkAdmin(firebase_uid))) {
        throw new HttpException(401, "Must be an admin to update assignment");
    }

    const { courseId, assignmentId, title, description, deadline, marksAvailable, tags, task } =
        queryBody;

    const assignment = await Assignment.findById(assignmentId).catch((err) => null);
    if (assignment === null) {
        throw new HttpException(400, "Failed to recall assignment");
    }

    const course = await Course.findById(courseId)
        .exec()
        .catch((err) => null);
    if (course === null) {
        throw new HttpException(500, "Failed to fetch course");
    }

    if (title !== undefined) {
        assignment.title = title;
    }

    if (description !== undefined) {
        assignment.description = description;
    }

    if (deadline !== undefined) {
        assignment.deadline = deadline;
    }

    if (marksAvailable !== undefined) {
        // Check mark valid
        if (marksAvailable < 0) {
            throw new HttpException(400, "Mark must be positive");
        }

        assignment.marksAvailable = marksAvailable;
    }

    if (assignment.task !== undefined && task !== undefined) {
        throw new HttpException(400, "Assignment is already an assigned task");
    } else if (task !== undefined) {
        assignment.task = task;
    }

    if (tags !== undefined && tags.length !== 0) {
        assignment.tags = new Types.Array();
        for (const tag of tags) {
            if (!course.tags.includes(tag)) {
                throw new HttpException(400, `Tag '${tag}' not in course tags`);
            }
            assignment.tags.addToSet(tag);
        }
    }

    await assignment.save().catch((err) => {
        logger.error(err);
        throw new HttpException(500, "Failed to save new assignment");
    });

    return assignment._id.toString() as string;
};
