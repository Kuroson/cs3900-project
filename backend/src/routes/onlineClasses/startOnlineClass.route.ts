import { HttpException } from "@/exceptions/HttpException";
import OnlineClass from "@/models/course/onlineClass/onlineClass.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";
import { checkAdmin } from "../admin/admin.route";

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
export const startOnlineClassController = async (
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
            await triggerOnlineClass(classId, true);
            return res.status(200).json({ message: "Successfully started class" });
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
 * Sets the online class to running
 * @param classId
 * @param running
 * @throws { HttpException }
 */
export const triggerOnlineClass = async (classId: string, running: boolean): Promise<void> => {
    // Find the classId
    const onlineClass = await OnlineClass.findById(classId).catch(() => null);

    if (onlineClass === null)
        throw new HttpException(400, `Online class of id ${classId} not found`);

    onlineClass.running = running;

    // Save the class
    await onlineClass.save().catch(() => {
        throw new HttpException(500, "Failed to save online class");
    });
    return;
};
