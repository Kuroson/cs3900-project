import { HttpException } from "@/exceptions/HttpException";
import AssignmentSubmission from "@/models/course/enrolment/assignmentSubmission.model";
import Enrolment from "@/models/course/enrolment/enrolment.model";
import { checkAuth, recallFileUrl } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, getUserId, isValidBody } from "@/utils/util";
import { Request, Response } from "express";

type ResponsePayload = {
    submissionId: string;
    fileType: string;
    linkToSubmission: string; // i.e., download link
};

type QueryPayload = {
    courseId: string;
    assignmentId: string;
    title: string;
};

/**
 * POST /assignment/submit
 * Submit an assignment and upload file to firebase store
 * @param req
 * @param res
 * @returns
 */
export const submitAssignmentController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["courseId", "assignmentId", "title"];
        if (isValidBody<QueryPayload>(req.body, KEYS_TO_CHECK)) {
            // Body has been verified
            const queryBody = req.body;

            const ret_data = await submitAssignment(queryBody, authUser.uid, req.file);

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
 * Submits assignment for a student in a course
 *
 * @param queryBody Arguments containing the fields defined above in QueryPayload
 * @param firebase_uid Unique identifier of user
 * @throws { HttpException } Save/recall error
 * @returns Ret data based on ResponsePayload above
 */
export const submitAssignment = async (
    queryBody: QueryPayload,
    firebase_uid: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    file: any,
) => {
    const { courseId, assignmentId, title } = queryBody;

    const enrolment = await Enrolment.findOne({
        student: await getUserId(firebase_uid),
        course: courseId,
    }).catch((err) => null);
    if (enrolment === null) {
        throw new HttpException(400, "Failed to fetch enrolment");
    }

    const submissionId = await new AssignmentSubmission({
        assignment: assignmentId,
        title,
        storedName: file.fileRef.name,
        fileType: file.mimetype,
    })
        .save()
        .then((res) => {
            return res._id;
        })
        .catch((err) => {
            logger.error(err);
            throw new HttpException(500, "Failed to save submission");
        });

    enrolment.assignmentSubmissions.push(submissionId);
    await enrolment.save().catch((err) => {
        logger.error(err);
        throw new HttpException(500, "Failed to save updated enrolment");
    });

    return {
        submissionId,
        fileType: file.mimetype,
        linkToSubmission: await recallFileUrl(file.fileRef.name),
    };
};
