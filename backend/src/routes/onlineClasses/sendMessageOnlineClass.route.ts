import { HttpException } from "@/exceptions/HttpException";
import Message, { MessageInterface } from "@/models/course/onlineClass/message.model";
import OnlineClass from "@/models/course/onlineClass/onlineClass.model";
import User from "@/models/user.model";
import Enrolment from "@/models/course/enrolment/enrolment.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";
import { checkAdmin } from "../admin/admin.route";
import { getKudos } from "../course/getKudosValues.route";

type ResponsePayload = {
    messageId: string;
    chatMessages: Array<MessageInterface>;
};

type QueryPayload = {
    classId: string;
    message: string;
    courseId: string;
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
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["classId", "message", "courseId"];

        if (isValidBody<QueryPayload>(req.body, KEYS_TO_CHECK)) {
            const { classId, message, courseId } = req.body;
            const messageId = await addNewChatMessage(classId, authUser.uid, message, courseId);

            const onlineClass = await OnlineClass.findById(classId, "chatMessages")
                .populate({
                    path: "chatMessages",
                    model: "Message",
                    options: { sort: { timestamp: 1 } },
                })
                .exec()
                .catch(() => null);

            return res.status(200).json({
                messageId: messageId,
                chatMessages: onlineClass?.chatMessages.toObject(),
            });
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
 * @throws { HttpException } classID or senderFirebaseUID does not match any existing class or user.
 * Or if chat functionality is disabled and they are not an admin
 * @returns
 */
export const addNewChatMessage = async (
    classId: string,
    senderFirebaseUID: string,
    message: string,
    courseId: string,
): Promise<string> => {
    // Find the class
    const onlineClass = await OnlineClass.findById(classId).catch(() => null);
    if (onlineClass === null) throw new HttpException(400, `Class with id ${classId} not found`);

    // Find the sender
    const sender = await User.findOne({ firebase_uid: senderFirebaseUID }).catch(() => null);
    if (sender === null)
        throw new HttpException(400, `User with firebase_uid ${senderFirebaseUID} not found`);

    const isAdmin = await checkAdmin(senderFirebaseUID);

    if ((!onlineClass.chatEnabled || !onlineClass.running) && !isAdmin) {
        // Chat is disabled or class is over and they are not an admin
        throw new HttpException(400, "Cannot send a message at the moment");
    }

    // Create message and save message
    const newMessage = new Message({
        message: message,
        sender: sender._id.toString(),
        timestamp: Date.now() / 1000,
        senderName: `${sender.first_name} ${sender.last_name}`,
    });
    const messageId = await newMessage
        .save()
        .then((res) => res._id.toString() as string)
        .catch((err) => {
            throw new HttpException(500, "Error saving message", err);
        });
    // Add to class
    onlineClass.chatMessages.addToSet(messageId);

    // Save class
    await onlineClass.save().catch((err) => {
        throw new HttpException(500, "Error saving class", err);
    });

    //Mark attendance for attending and engaging in class
    if (onlineClass.attendanceList.includes(sender._id) === false) {
        //Student isn't already marked as attended
        onlineClass.attendanceList.addToSet(sender._id);
        await onlineClass.save().catch((err) => {
            throw new HttpException(500, "Error saving attendance", err);
        });
        //Give kudos for attending
        const courseKudos = await getKudos(courseId);
        const myStudent = await User.findOne({ _id: sender._id })
            .select("_id kudos")
            .exec()
            .catch(() => null);

        if (myStudent === null)
            throw new HttpException(400, `Student of ${sender._id} does not exist`);
        myStudent.kudos = myStudent.kudos + courseKudos.attendance;

        await myStudent.save().catch((err) => {
            throw new HttpException(500, "Failed to add kudos to user", err);
        });

        const enrolment = await Enrolment.findOne({
            student: sender._id,
            course: courseId,
        }).catch((err) => null);
        if (enrolment === null) {
            throw new HttpException(400, "Failed to fetch enrolment");
        }
        
        //Update kudos for the enrolment object for dashboard updates
        enrolment.kudosEarned = enrolment.kudosEarned + courseKudos.attendance;
        await enrolment.save().catch((err) => {
            throw new HttpException(500, "Failed to add kudos to enrolment", err);
        });
    }

    return messageId;
};
