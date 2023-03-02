import { HttpException } from "@/exceptions/HttpException";
import { verifyIdToken } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";

type ResponsePayload = {
    message: string;
    email?: string;
    uid?: string;
};

type QueryPayload = {
    message: string;
};

export const exampleController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload>,
) => {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

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
        if (isValidBody<QueryPayload>(req.body, ["message"])) {
            const queryBody = req.body;
            // Body has been verified
            const { message } = queryBody;

            logger.info(`MESSAGE: ${message}`);
            return res
                .status(200)
                .json({ message: "Success", email: authUser.email, uid: authUser.uid });
        } else {
            throw new HttpException(
                400,
                `Missing body f: ${getMissingBodyIDs<QueryPayload>(req.body, ["message"])}`,
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
