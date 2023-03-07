import { HttpException } from "@/exceptions/HttpException";
import User from "@/models/user.model";
import { verifyIdToken } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";

type ResponsePayload = {
    isAdmin: boolean;
    message?: string;
};

type QueryPayload = {};

export const adminController = async (
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
        if (isValidBody<QueryPayload>(req.body, [])) {
            // Body has been verified
            const queryBody = req.body;

            // Get user from database to check permissions
            let isAdmin = false;
            await User.findOne({ firebase_uid: authUser.uid })
                .then((res) => {
                    isAdmin = res !== null && res.role === 0;
                })
                .catch((err) => {
                    console.error(err);
                });

            logger.info(`isAdmin: ${isAdmin}`);
            return res.status(200).json({ isAdmin });
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
                .json({ message: error.getMessage(), isAdmin: false });
        } else {
            logger.error(error);
            return res
                .status(500)
                .json({ message: "Internal server error. Error was not caught", isAdmin: false });
        }
    }
};
