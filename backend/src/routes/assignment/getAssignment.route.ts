import { HttpException } from "@/exceptions/HttpException";
import Assignment from "@/models/course/assignment/assignment.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, getUserId, isValidBody } from "@/utils/util";
import { Request, Response } from "express";

type SubmissionInfo = {
    title: string;
    linkToSubmission: string;
    mark?: number;
    comments?: string;
    successTags?: Array<string>;
    improvementTags?: Array<string>;
};

type ResponsePayload = {
    title: string;
    description?: string;
    deadline: string;
    marksAvailable: number;
    tags: Array<string>;
    submission?: SubmissionInfo;
};

type QueryPayload = {
    courseId: string;
    assignmentId: string;
};

/**
 * GET /assignment
 * Gets all the assignment details
 * @param req
 * @param res
 * @returns
 */
export const getAssignmentController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["courseId", "assignmentId"];

        // User has been verified
        if (isValidBody<QueryPayload>(req.query, KEYS_TO_CHECK)) {
            // Body has been verified
            const queryBody = req.query;

            const ret_data = await getAssignment(queryBody, authUser.uid);

            return res.status(200).json(ret_data);
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
 * Gets all the quiz info for the student. The information returned varies based on the
 * current student's state regarding the quiz. If the student has not completed the quiz,
 * it will not include questions. If the student has completed the quiz it will include the
 * question and responses. If it is after the due date, the correct answers will be displayed.
 * Extended responses will only show mark awarded after they have been marked.
 *
 * @param queryBody Arguments containing the fields defined above in QueryPayload
 * @param firebase_uid Unique identifier of user
 * @throws { HttpException } Recall failed
 * @returns Object of quiz information
 */
export const getAssignment = async (queryBody: QueryPayload, firebase_uid: string) => {
    const { courseId, assignmentId } = queryBody;

    const assignment = await Assignment.findById(assignmentId).catch((err) => {
        logger.error(err);
        throw new HttpException(500, "Failed to recall assignment");
    });
    if (assignment === null) {
        throw new HttpException(500, "Failed to recall assignment");
    }

    const ret_data: ResponsePayload = {
        title: assignment.title,
        deadline: assignment.deadline,
        marksAvailable: assignment.marksAvailable,
        tags: [],
    };

    if (assignment.description !== undefined) {
        ret_data.description = assignment.description;
    }

    for (const tag of assignment.tags) {
        ret_data.tags.push(tag);
    }

    // TODO: Add attempt

    return ret_data;
};
