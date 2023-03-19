import { HttpException } from "@/exceptions/HttpException";
import User from "@/models/user.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";

type ResponsePayload = {
    canAccess: boolean;
};

type QueryPayload = {
    // objectId of the course in MongoDB
    courseId: string;
};

/**
 * GET /admin/access
 * Checks whether a user should be able to access a given course
 * `courseId` is a query parameter and should be passed in the URL
 * @param req
 * @param res
 * @returns
 */
export const accessController = async (
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
            const { courseId } = queryBody;

            const canAccess = await checkAccess(authUser.uid, courseId);

            logger.info(`canAccess: ${canAccess}`);
            return res.status(200).json({ canAccess });
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
 * Checks whether a user should be able to access a given course
 * This will mean they are either an instructor/admin or they are enrolled
 * in the course
 *
 * @param firebase_uid Unique identifier of user within the system
 * @param courseId mongoDB Id of the course that the user wishes to access
 * @returns Whether the user should be able to access the course
 */
export const checkAccess = async (firebase_uid: string, courseId: string) => {
    // Get user from database to check permissions
    let canAccess = false;
    await User.findOne({ firebase_uid })
        .then((res) => {
            canAccess = res !== null && (res.role === 0 || res.enrolments.includes(courseId));
        })
        .catch((err) => {
            console.error(err);
        });

    return canAccess;
};
