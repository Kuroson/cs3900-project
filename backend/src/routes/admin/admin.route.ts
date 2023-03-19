import { HttpException } from "@/exceptions/HttpException";
import User from "@/models/user.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload } from "@/utils/util";
import { Request, Response } from "express";

type ResponsePayload = {
    isAdmin: boolean;
};

type QueryPayload = Record<string, never>;

/**
 * GET /admin
 * Check if user is an admin based on JWT authorization token
 * @param req
 * @param res
 * @returns
 */
export const adminController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req); // User has been verified

        // Get user from database to check permissions
        const isAdmin = await checkAdmin(authUser.uid);

        logger.info(`isAdmin: ${isAdmin}`);
        return res.status(200).json({ isAdmin });
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
 * Checks whether the given user (denoted by their unique uid) is
 * and admin (instructor) within the system
 * @param firebase_uid Unique identifier of user
 * @returns Boolean of whether the user is an admin
 */
export const checkAdmin = async (firebase_uid: string) => {
    // Get user from database to check permissions
    let isAdmin = false;
    await User.findOne({ firebase_uid })
        .then((res) => {
            isAdmin = res !== null && res.role === 0;
        })
        .catch((err) => {
            console.error(err);
        });

    return isAdmin;
};
