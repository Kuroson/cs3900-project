import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course/course.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";
import { checkAdmin } from "../admin/admin.route";

type ResponsePayload = {};

type QueryPayload = {
    courseId: string;
    archived: boolean;
};

/**
 * POST /course/archive
 * Sets course as archived or unarchived
 * @param req
 * @param res
 * @returns
 */
export const archiveCourseController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["courseId", "archived"];

        // User has been verified
        if (isValidBody<QueryPayload>(req.body, KEYS_TO_CHECK)) {
            // Body has been verified
            const queryBody = req.body;

            await archiveCourse(queryBody, authUser.uid);

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
 * Sets the archived status for a given course
 *
 * @param queryBody Arguments containing the fields defined above in QueryPayload
 * @param firebase_uid Unique identifier of user
 * @throws { HttpException } Recall/save failure
 */
export const archiveCourse = async (queryBody: QueryPayload, firebase_uid: string) => {
    if (!(await checkAdmin(firebase_uid))) {
        throw new HttpException(401, "Must be an admin to archive course");
    }

    const { courseId, archived } = queryBody;

    const course = await Course.findById(courseId).catch((err) => null);
    if (course === null) {
        throw new HttpException(400, "Failed to recall course");
    }

    course.archived = archived;

    await course.save().catch((err) => {
        logger.error(err);
        throw new HttpException(500, "Failed to save updated course");
    });
};
