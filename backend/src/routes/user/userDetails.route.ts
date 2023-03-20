import { HttpException } from "@/exceptions/HttpException";
import User, { UserInterfaceFull, isRoleAdmin } from "@/models/user.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { Nullable, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";

type ErrorPayload = {
    message: string;
};

type ResponsePayload = {
    userDetails: UserInterfaceFull;
};

type QueryPayload = {
    // Email of user to look up
    email: string;
};

/**
 * Get the user's details.
 *
 * Finds all the courses for a given user. If this is an admin/instructor it
 * will be the courses they have created. If this is a student, this will be
 * their enrolled courses.
 *
 * @param email user to look for
 * @param authUserEmail user asking for the details
 * @throws { HttpException } if it fails to find the user or if the authUserEmail is not
 *                           an admin and its requesting another user's details
 * @returns
 */
export const getUserDetails = async (
    email: string,
    authUserEmail: string,
): Promise<UserInterfaceFull> => {
    // 1. Get the user details of the firebase authUser;
    const requester = await User.findOne({ email: authUserEmail })
        .populate("enrolments", "_id course")
        // Because only admins have this array filled,its ok to probably just request everything
        .populate("created_courses")
        .exec();
    if (requester === null) {
        // Failed to find the owner of the token
        throw new HttpException(400, `Email associated with token doesn't exist: ${email}`);
    }

    if (email === authUserEmail) {
        // Requested email is authUser's email
        return requester;
    }

    // Email is different, must be an admin to request another user's details
    if (!isRoleAdmin(requester.role)) {
        throw new HttpException(403, "Must be an admin to request another user's details");
    }

    // 2. Get the user details of the requested user
    const userLookup = await User.findOne({ email: email })
        .populate("enrolments", "_id course")
        .populate("created_courses")
        .exec();

    if (userLookup === null) {
        throw new HttpException(400, `Email queried does not exist: ${email}`);
    }

    return userLookup;
};

/**
 * GET /user/details
 * Attempts to get the user details of the user associated with the email.
 * Must be an admin/instructor in order to request another user's details
 * @param req
 * @param res
 * @returns
 */
export const userDetailsController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorPayload>,
) => {
    try {
        if (req.method !== "GET") throw new HttpException(405, "Method not allowed");

        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["email"];

        if (isValidBody<QueryPayload>(req.query, KEYS_TO_CHECK)) {
            const { email } = req.query;

            const userDetails = await getUserDetails(email, authUser.email ?? "");

            return res.status(200).json({ userDetails });
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
