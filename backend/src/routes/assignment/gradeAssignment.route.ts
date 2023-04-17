import { Request, Response } from "express";
import { Types } from "mongoose";
import { HttpException } from "@/exceptions/HttpException";
import Assignment from "@/models/course/assignment/assignment.model";
import AssignmentSubmission from "@/models/course/enrolment/assignmentSubmission.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { checkAdmin } from "../admin/admin.route";

type ResponsePayload = Record<string, never>;

type QueryPayload = {
    submissionId: string;
    assignmentId: string;
    mark: number;
    comment: string;
    successTags: Array<string>;
    improvementTags: Array<string>;
};

/**
 * POST /assignment/grade
 * Grade a given submission
 * @param req
 * @param res
 * @returns
 */
export const gradeAssignmentController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = [
            "submissionId",
            "assignmentId",
            "mark",
            "comment",
            "successTags",
            "improvementTags",
        ];

        // User has been verified
        if (isValidBody<QueryPayload>(req.body, KEYS_TO_CHECK)) {
            // Body has been verified
            const queryBody = req.body;

            await gradeAssignment(queryBody, authUser.uid);

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
 * Grades a given question within a quiz
 *
 * @param queryBody Arguments containing the fields defined above in QueryPayload
 * @param firebase_uid Unique identifier of user
 * @throws { HttpException } Recall/save error, mark above assignment max
 */
export const gradeAssignment = async (queryBody: QueryPayload, firebase_uid: string) => {
    if (!(await checkAdmin(firebase_uid))) {
        throw new HttpException(401, "Must be an admin to create quiz");
    }

    const { submissionId, assignmentId, mark, comment, successTags, improvementTags } = queryBody;

    const submission = await AssignmentSubmission.findById(submissionId).catch((err) => {
        logger.error(err);
        throw new HttpException(400, "Failed to recall submission");
    });
    if (submission === null) {
        throw new HttpException(400, "Failed to recall submission");
    }

    const assignment = await Assignment.findById(assignmentId).catch((err) => {
        logger.error(err);
        throw new HttpException(400, "Failed to recall assignment");
    });
    if (assignment === null) {
        throw new HttpException(400, "Failed to recall assignment");
    }

    // Check mark valid
    if (mark < 0) {
        throw new HttpException(400, "Mark awarded must be positive");
    } else if (mark > assignment.marksAvailable) {
        throw new HttpException(400, "Cannot award more than maximum mark");
    }

    submission.mark = mark;
    submission.comments = comment;
    submission.successfulTags = new Types.Array<string>();
    submission.improvementTags = new Types.Array<string>();

    for (const tag of successTags) {
        submission.successfulTags.push(tag);
    }
    for (const tag of improvementTags) {
        submission.improvementTags.push(tag);
    }

    await submission.save().catch((err) => {
        logger.error(err);
        throw new HttpException(500, "Failed to save updated submission");
    });
};
