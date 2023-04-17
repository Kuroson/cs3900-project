import { Request, Response } from "express";
import { HttpException } from "@/exceptions/HttpException";
import User, { INSTRUCTOR_ROLE, STUDENT_ROLE } from "@/models/user.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";

type ResponsePayload = {
    message: string;
};

type QueryPayload = {
    /**
     * User email to promote or demote
     */
    userEmail: string;
    instructor: boolean;
};

/**
 * PUT /admin/instructor/set
 * Sets a user as an instructor or not
 * @param req
 * @param res
 * @returns
 */
export const adminInstructorSetController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["userEmail", "instructor"];

        // User has been verified
        if (isValidBody<QueryPayload>(req.body, KEYS_TO_CHECK)) {
            // Body has been verified
            const { userEmail, instructor } = req.body;
            await updateUserInstructor(userEmail, instructor);
            return res
                .status(200)
                .json({ message: `Successfully ${instructor ? "promoted" : "demoted"} user` });
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
 * Sets `userEmail` as an instructor depending on `instructor` boolean
 * @param userEmail
 * @param instructor
 * @throws { HttpException }
 */
export const updateUserInstructor = async (
    userEmail: string,
    instructor: boolean,
): Promise<void> => {
    // Find user
    const user = await User.findOne({ email: userEmail }).catch(() => null);
    if (user === null) {
        throw new HttpException(400, "User does not exist");
    }
    // Update
    user.role = instructor ? INSTRUCTOR_ROLE : STUDENT_ROLE;
    await user.save().catch((err) => {
        throw new HttpException(500, "Error saving user", err);
    });
    return;
};
