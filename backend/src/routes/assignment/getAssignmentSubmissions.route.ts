import { HttpException } from "@/exceptions/HttpException";
import Assignment from "@/models/course/assignment/assignment.model";
import Course from "@/models/course/course.model";
import AssignmentSubmission from "@/models/course/enrolment/assignmentSubmission.model";
import { checkAuth, recallFileUrl } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";
import { checkAdmin } from "../admin/admin.route";

type SubmissionInfo = {
    submissionId: string;
    studentId: string;
    title: string;
    linkToSubmission: string;
    fileType: string;
};

type AssignmentInfo = {
    assignmentId: string;
    title: string;
    marks: number;
    tags: Array<string>;
};

type ResponsePayload = {
    assignment: AssignmentInfo;
    submissions: Array<SubmissionInfo>;
};

type QueryPayload = {
    courseId: string;
    assignmentId: string;
};

/**
 * GET /assignment/submissions
 * Gets all unmarked quiz submissions
 * @param req
 * @param res
 * @returns
 */
export const getAssignmentSubmissionsController = async (
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

            const ret_data = await getAssignmentSubmissions(queryBody, authUser.uid);

            logger.info(`ret_data: ${ret_data}`);
            return res.status(200).json(ret_data);
        } else {
            throw new HttpException(
                400,
                `Missing body keys: ${getMissingBodyIDs<QueryPayload>(req.query, KEYS_TO_CHECK)}`,
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
 * Gets all unmaked submissions for the given assignment
 *
 * @param queryBody Arguments containing the fields defined above in QueryPayload
 * @param firebase_uid Unique identifier of user
 * @throws { HttpException } Recall failure
 * @returns The list of assignments each with their submissions
 */
export const getAssignmentSubmissions = async (queryBody: QueryPayload, firebase_uid: string) => {
    if (!(await checkAdmin(firebase_uid))) {
        throw new HttpException(401, "Must be an admin to get submissions");
    }

    const { courseId, assignmentId } = queryBody;

    AssignmentSubmission;
    const course = await Course.findById(courseId)
        .populate({
            path: "students",
            model: "Enrolment",
            select: "_id assignmentSubmissions student",
            populate: {
                path: "assignmentSubmissions",
                model: "AssignmentSubmission",
            },
        })
        .catch((err) => {
            logger.error(err);
            throw new HttpException(400, "Failed to fetch course and submission info");
        });
    if (course === null) {
        throw new HttpException(400, "Failed to fetch course and submission info");
    }

    const assignment = await Assignment.findById(assignmentId).catch((err) => {
        logger.error(err);
        throw new HttpException(400, "Failed to fetch assignment");
    });
    if (assignment === null) {
        throw new HttpException(400, "Failed to fetch assignment");
    }

    const assignmentInfo: AssignmentInfo = {
        assignmentId: assignment._id.toString(),
        title: assignment.title,
        marks: assignment.marksAvailable,
        tags: [],
    };

    for (const tag of assignment.tags) {
        assignmentInfo.tags.push(tag);
    }

    const submissions: Array<SubmissionInfo> = new Array<SubmissionInfo>();

    for (const student of course.students) {
        const currStudent = student.student;
        for (const submission of student.assignmentSubmissions) {
            if (!submission.assignment._id.equals(assignmentId)) {
                continue;
            }
            // This is the assignment, now find check if it is marked
            if (submission.mark !== undefined) {
                continue;
            }
            // Found an unmarked submission
            const submissionInfo: SubmissionInfo = {
                submissionId: submission._id,
                studentId: currStudent,
                title: submission.title,
                linkToSubmission: await recallFileUrl(submission.storedName),
                fileType: "", // TODO
            };
            submissions.push(submissionInfo);
        }
    }

    return { assignment: assignmentInfo, submissions: submissions };
};
