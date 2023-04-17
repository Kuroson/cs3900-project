import { Request, Response } from "express";
import { HttpException } from "@/exceptions/HttpException";
import Assignment from "@/models/course/assignment/assignment.model";
import AssignmentSubmission, {
    AssignmentSubmissionInterface,
} from "@/models/course/enrolment/assignmentSubmission.model";
import Enrolment, { EnrolmentInterface } from "@/models/course/enrolment/enrolment.model";
import { checkAuth, recallFileUrl } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, getUserId, isValidBody } from "@/utils/util";
import { checkAdmin } from "../admin/admin.route";

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

    const assignment = await Assignment.findById(assignmentId).catch((err) => null);
    if (assignment === null) {
        throw new HttpException(400, "Failed to recall assignment");
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

    // If student and has submission, get it
    const isAdmin = await checkAdmin(firebase_uid);
    if (isAdmin) {
        return ret_data;
    }

    const submission: AssignmentSubmissionInterface | null = await getAssignmentSubmission(
        courseId,
        firebase_uid,
        assignmentId,
    );

    if (submission === null) {
        return ret_data;
    }

    const submissionInfo: SubmissionInfo = {
        title: submission.title,
        linkToSubmission: await recallFileUrl(submission.storedName),
    };

    if (submission.mark !== undefined) {
        submissionInfo.mark = submission.mark;
    }

    if (submission.comments !== undefined) {
        submissionInfo.comments = submission.comments;
    }

    if (submission.successfulTags !== undefined) {
        submissionInfo.successTags = [];
        for (const tag of submission.successfulTags) {
            submissionInfo.successTags.push(tag);
        }
    }

    if (submission.improvementTags !== undefined) {
        submissionInfo.improvementTags = [];
        for (const tag of submission.improvementTags) {
            submissionInfo.improvementTags.push(tag);
        }
    }

    ret_data.submission = submissionInfo;

    return ret_data;
};

const getAssignmentSubmission = async (
    courseId: string,
    firebase_uid: string,
    assignmentId: string,
) => {
    // Get enrolment
    AssignmentSubmission;
    type assignmentEnrolmentType =
        | (Omit<EnrolmentInterface, "assignmentSubmissions"> & {
              assignmentSubmissions: Array<AssignmentSubmissionInterface>;
          })
        | null;

    const enrolment: assignmentEnrolmentType = await Enrolment.findOne({
        student: await getUserId(firebase_uid),
        course: courseId,
    })
        .populate({
            path: "assignmentSubmissions",
            model: "AssignmentSubmission",
        })
        .catch((err) => null);
    if (enrolment === null) {
        throw new HttpException(400, "Failed to fetch enrolment");
    }

    for (const submission of enrolment.assignmentSubmissions) {
        const isAssignment: boolean = submission.assignment.equals(assignmentId);
        if (isAssignment) {
            return submission;
        }
    }
    return null;
};
