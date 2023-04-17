import { Request, Response } from "express";
import { HttpException } from "@/exceptions/HttpException";
import OnlineClass from "@/models/course/onlineClass/onlineClass.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { checkAdmin } from "../admin/admin.route";

type ResponsePayload = {
    classId: string;
};

type QueryPayload = {
    classId: string;
    title: string;
    description: string;
    startTime: number;
    linkToClass: string;
};

/**
 * PUT /class/update
 * Update the online class's information
 * @param req
 * @param res
 */
export const updateOnlineClassController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = [
            "classId",
            "title",
            "description",
            "startTime",
            "linkToClass",
        ];

        if (isValidBody<QueryPayload>(req.body, KEYS_TO_CHECK)) {
            const { classId, title, description, startTime, linkToClass } = req.body;

            if (!(await checkAdmin(authUser.uid))) {
                throw new HttpException(403, "Must be an admin to schedule a class");
            }

            await updateOnlineClassDetails(classId, title, description, startTime, linkToClass);

            return res.status(200).json({ classId });
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
 * Updates online class of `classId` with new information provided
 * @param classId id of class to update
 * @param title
 * @param description
 * @param startTime
 * @param linkToClass
 * @throws { HttpException } if class not found or failed to save
 */
export const updateOnlineClassDetails = async (
    classId: string,
    title: string,
    description: string,
    startTime: number,
    linkToClass: string,
): Promise<void> => {
    // Find class
    const onlineClass = await OnlineClass.findById(classId).catch(() => null);
    if (onlineClass === null) throw new HttpException(400, `Class with id ${classId} not found`);

    // Update class
    onlineClass.title = title;
    onlineClass.description = description;
    onlineClass.startTime = startTime;
    onlineClass.linkToClass = linkToClass;

    // Save
    await onlineClass.save().catch((err) => {
        throw new HttpException(500, `Failed to save class with id ${classId}`, err);
    });

    return;
};
