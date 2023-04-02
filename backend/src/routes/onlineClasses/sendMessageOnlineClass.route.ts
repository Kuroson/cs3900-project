import { HttpException } from "@/exceptions/HttpException";
import Message from "@/models/course/onlineClass/message.model";
import OnlineClass from "@/models/course/onlineClass/onlineClass.model";
import User from "@/models/user.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";

type ResponsePayload = {
    messageId: string;
};

type QueryPayload = {
    classId: string;
    senderFirebaseUID: string;
    message: string;
};

/**
 * POST /class/chat/send
 * Adds a message to a class
 * @param req
 * @param res
 */
export const sendChatMessageController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = [
            "classId",
            "senderFirebaseUID",
            "message",
        ];

        if (isValidBody<QueryPayload>(req.body, KEYS_TO_CHECK)) {
            const { classId, senderFirebaseUID, message } = req.body;
            const messageId = await addNewChatMessage(classId, senderFirebaseUID, message);
            return res.status(200).json({ messageId: messageId });
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
 * Creates and adds a new message to a class
 * @param classId
 * @param senderFirebaseUID
 * @param message
 * @returns
 */
export const addNewChatMessage = async (
    classId: string,
    senderFirebaseUID: string,
    message: string,
): Promise<string> => {
    // Find the class
    const onlineClass = await OnlineClass.findById(classId).catch(() => null);
    if (onlineClass === null) throw new HttpException(400, `Class with id ${classId} not found`);

    // Find the sender
    const sender = await User.findOne({ firebase_uid: senderFirebaseUID }).catch(() => null);
    if (sender === null)
        throw new HttpException(400, `User with firebase_uid ${senderFirebaseUID} not found`);

    // Create message and save message
    const newMessage = new Message({ message: message, sender: sender._id.toString() });
    const messageId = await newMessage
        .save()
        .then((res) => res._id.toString() as string)
        .catch(() => {
            throw new HttpException(500, "Error saving message");
        });
    // Add to class
    onlineClass.chatMessages.addToSet(messageId);

    // Save class
    await onlineClass.save().catch(() => {
        throw new HttpException(500, "Error saving class");
    });
    return messageId;
};
