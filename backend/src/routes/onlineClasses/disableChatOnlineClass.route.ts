import { HttpException } from "@/exceptions/HttpException";
import OnlineClass from "@/models/course/onlineClass/onlineClass.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";
import { checkAdmin } from "../admin/admin.route";
import { updateChatEnabled } from "./enableChatOnlineClass.route";

type ResponsePayload = {
    message: string;
};

type QueryPayload = {
    classId: string;
};

/**
 * PUT /class/chat/disable
 * Disables chat for a class
 * @param req
 * @param res
 */
export const disableChatOnlineClassController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["classId"];

        if (isValidBody<QueryPayload>(req.body, KEYS_TO_CHECK)) {
            const { classId } = req.body;

            if (!(await checkAdmin(authUser.uid))) {
                throw new HttpException(403, "Must be an admin to change chat status");
            }
            await updateChatEnabled(classId, false);
            return res.status(200).json({ message: "Chat has been disabled" });
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
