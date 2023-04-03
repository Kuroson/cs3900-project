import { HttpException } from "@/exceptions/HttpException";
import Message from "@/models/course/onlineClass/message.model";
import OnlineClass, {
    FullOnlineClassInterface,
} from "@/models/course/onlineClass/onlineClass.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";

type ResponsePayload = FullOnlineClassInterface;

type QueryPayload = {
    classId: string;
};

/**
 * GET /class
 * Gets a class based on classId
 * @param req
 * @param res
 */
export const getOnlineClassController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["classId"];

        if (isValidBody<QueryPayload>(req.query, KEYS_TO_CHECK)) {
            const { classId } = req.query;
            const classData = await getClassFromId(classId);
            return res.status(200).json({ ...classData.toObject() });
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

/**
 * Gets all class information stored in MongoDB
 * @param classId id to query
 * @throws { HttpException } if classId is not found
 * @returns
 */
export const getClassFromId = async (classId: string): Promise<FullOnlineClassInterface> => {
    Message; // Load Mongoose message

    const onlineClass = await OnlineClass.findById(classId)
        .populate({ path: "chatMessages", model: "Message", options: { sort: { timestamp: 1 } } })
        .exec()
        .catch(() => null);
    if (onlineClass === null) throw new HttpException(400, `Could not find class of id ${classId}`);

    return onlineClass;
};
