import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course/course.model";
import Enrolment from "@/models/course/enrolment/enrolment.model";
import User from "@/models/user.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";
import { checkAdmin } from "../admin/admin.route";

type AssignmentInfo = {
    assignmentId: string;
    title: string;
    description?: boolean;
    deadline: string;
};

type ResponsePayload = {
    assignments: Array<AssignmentInfo>;
};

type QueryPayload = {
    courseId: string;
};

/**
 * GET /assignment/list
 * Gets a list of all assignments in the course
 * @param req
 * @param res
 * @returns
 */
export const getAssignmentsController = async (
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

            const assignments = await getAssignments(queryBody, authUser.uid);

            logger.info(`assignments: ${assignments}`);
            return res.status(200).json({ assignments });
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
 * Gets a list of all assignments in the course with their basic information
 *
 * @param queryBody Arguments containing the fields defined above in QueryPayload
 * @param firebase_uid Unique identifier of user
 * @throws { HttpException } Course recall failed
 * @returns The list of assignments with the required information
 */
export const getAssignments = async (queryBody: QueryPayload, firebase_uid: string) => {
    const { courseId } = queryBody;

    const course = await Course.findById(courseId)
        .populate({
            path: "assignments",
            model: "Assignment",
        })
        .exec()
        .catch((err) => {
            logger.error(err);
            throw new HttpException(500, "Failed to fetch course");
        });

    if (course === null) {
        throw new HttpException(500, "Failed to fetch course");
    }

    const assignments: Array<AssignmentInfo> = [];

    for (const assignment of course.assignments) {
        const isAdmin = await checkAdmin(firebase_uid);

        const user = await User.findOne({ firebase_uid }).catch((err) => {
            throw new HttpException(500, "Cannot fetch user");
        });

        if (user === null) {
            throw new HttpException(500, "Cannot fetch user");
        }

        const assignmentInfo: AssignmentInfo = {
            assignmentId: assignment._id,
            title: assignment.title,
            deadline: assignment.deadline,
        };

        if (assignment.description !== undefined) {
            assignmentInfo.description = assignment.description;
        }

        assignments.push(assignmentInfo);
    }

    return assignments;
};
