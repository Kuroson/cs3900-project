import { HttpException } from "@/exceptions/HttpException";
import Assignment from "@/models/course/assignment/assignment.model";
import Course from "@/models/course/course.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";
import { checkAdmin } from "../admin/admin.route";

type ResponsePayload = {
    assignmentId: string;
};

type QueryPayload = {
    courseId: string;
    title: string;
    description?: string;
    deadline: string;
    marksAvailable: number;
    tags: Array<string>;
};

/**
 * POST /assignment/create
 * Creates a assignment
 * @param req
 * @param res
 * @returns
 */
export const createAssignmentController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = [
            "courseId",
            "title",
            "deadline",
            "marksAvailable",
            "tags",
        ];

        // User has been verified
        if (isValidBody<QueryPayload>(req.body, KEYS_TO_CHECK)) {
            // Body has been verified
            const queryBody = req.body;

            const assignmentId = await createAssignment(queryBody, authUser.uid);

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
 * Creates a new assignment with the parameters given.
 *
 * @param queryBody Arguments containing the fields defined above in QueryPayload
 * @param firebase_uid Unique identifier of user
 * @throws { HttpException } Save error, course not available, tags not in course.
 * no tags given
 * @returns The ID of the assignment that has been created
 */
export const createAssignment = async (queryBody: QueryPayload, firebase_uid: string) => {
    if (!(await checkAdmin(firebase_uid))) {
        throw new HttpException(401, "Must be an admin to create assignment");
    }

    const { courseId, title, description, deadline, marksAvailable, tags } = queryBody;

    const course = await Course.findById(courseId)
        .exec()
        .catch((err) => null);

    if (course === null) {
        throw new HttpException(400, "Failed to fetch course");
    }

    const myAssignment = await new Assignment({
        title,
        deadline,
        marksAvailable,
        tags: [],
    });

    if (description !== undefined) {
        myAssignment.description = description;
    }

    if (tags.length === 0) {
        throw new HttpException(400, "Must give tags for assignment");
    }

    for (const tag of tags) {
        if (!course.tags.includes(tag)) {
            throw new HttpException(400, `Tag '${tag}' not in course tags`);
        }
        myAssignment.tags.addToSet(tag);
    }

    myAssignment.save().catch((err) => null);

    course.assignments.push(myAssignment._id);

    await course.save().catch((err) => {
        logger.error(err);
        throw new HttpException(500, "Failed to save updated course");
    });

    return myAssignment._id;
};
