import { HttpException } from "@/exceptions/HttpException";
import User from "@/models/user.model";
import { verifyIdToken } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";

type ResponsePayload = {
    canAccess: boolean;
    message?: string;
};

type QueryPayload = {
    courseId: string;
};

export const accessController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload>,
) => {
    try {
        if (req.headers.authorization === undefined)
            throw new HttpException(405, "No authorization header found");

        // Verify token
        const token = req.headers.authorization.split(" ")[1];
        const authUser = await verifyIdToken(token)
            .then((res) => {
                if (res.id === null || res.email === null) {
                    throw new HttpException(401, "Expired token");
                }
                return res;
            })
            .catch((err) => {
                throw new HttpException(401, "Invalid token", err);
            });
        // User has been verified
        if (isValidBody<QueryPayload>(req.body, ["courseId"])) {
            // Body has been verified
            const queryBody = req.body;
            const { courseId } = queryBody;

            // Get user from database to check permissions
            let canAccess = false;
            await User.findOne({ firebase_uid: authUser.uid })
                .then((res) => {
                    console.log(res);
                    canAccess =
                        res !== null && (res.role === 0 || res.enrolments.includes(courseId));
                })
                .catch((err) => {
                    console.error(err);
                });

            logger.info(`canAccess: ${canAccess}`);
            return res.status(200).json({ canAccess });
        } else {
            throw new HttpException(
                400,
                `Missing body keys: ${getMissingBodyIDs<QueryPayload>(req.body, [])}`,
            );
        }
    } catch (error) {
        if (error instanceof HttpException) {
            logger.error(error.getMessage());
            logger.error(error.originalError);
            return res
                .status(error.getStatusCode())
                .json({ message: error.getMessage(), canAccess: false });
        } else {
            logger.error(error);
            return res
                .status(500)
                .json({ message: "Internal server error. Error was not caught", canAccess: false });
        }
    }
};
