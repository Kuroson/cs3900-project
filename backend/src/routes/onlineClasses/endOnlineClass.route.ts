import { Request, Response } from "express";
import { HttpException } from "@/exceptions/HttpException";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { checkAdmin } from "../admin/admin.route";
import { triggerOnlineClass } from "./startOnlineClass.route";

type ResponsePayload = {
    message: string;
};

type QueryPayload = {
    classId: string;
};

/**
 * PUT /class/start
 * Starts an online class
 * @param req
 * @param res
 */
export const endOnlineClassController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["classId"];

        if (isValidBody<QueryPayload>(req.body, KEYS_TO_CHECK)) {
            const { classId } = req.body;

            if (!(await checkAdmin(authUser.uid))) {
                throw new HttpException(403, "Must be an admin to schedule a class");
            }
            await triggerOnlineClass(classId, false);
            return res.status(200).json({ message: "Successfully ended class" });
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
