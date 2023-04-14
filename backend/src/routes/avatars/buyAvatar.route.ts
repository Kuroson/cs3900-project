import { HttpException } from "@/exceptions/HttpException";
import Course, { CourseInterface } from "@/models/course/course.model";
import Enrolment from "@/models/course/enrolment/enrolment.model";
import { ForumInterface } from "@/models/course/forum/forum.model";
import { PostInterface } from "@/models/course/forum/post.model";
import { ResponseInterface } from "@/models/course/forum/response.model";
import KudosValues, { KudosValuesInterface } from "@/models/course/kudosValues.model";
import { OnlineClassInterface } from "@/models/course/onlineClass/onlineClass.model";
import { PageInterface } from "@/models/course/page/page.model";
import { ResourceInterface } from "@/models/course/page/resource.model";
import { SectionInterface } from "@/models/course/page/section.model";
import User, { UserInterface } from "@/models/user.model";
import { avatarMap } from "@/utils/avatarMapper";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";

type ResponsePayload = {
    message: string;
};

type QueryPayload = {
    avatarToBuy: string;
};

/**
 * POST /avatar/buy
 * Buy an avatar and assigns it as their new avatar
 * @param req
 * @param res
 * @returns
 */
export const buyAvatarController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["avatarToBuy"];
        if (isValidBody<QueryPayload>(req.body, KEYS_TO_CHECK)) {
            const { avatarToBuy } = req.body;

            // const courseData = await getCourse(courseId, authUser.uid);

            await buyAvatar(authUser.uid, avatarToBuy);

            return res.status(200).json({ message: `Successfully bought ${avatarToBuy}` });
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

export const buyAvatar = async (firebaseUId: string, avatarToBuy: string): Promise<void> => {
    // Find user
    const user = await User.findOne({ firebase_uid: firebaseUId }).catch((err) => null);
    if (user === null) throw new HttpException(400, `User of ${firebaseUId} not found`);

    // Check if the avatar is valid
    if (Object.keys(avatarMap).find((x) => x === avatarToBuy) === undefined)
        throw new HttpException(400, `Avatar ${avatarToBuy} is not valid`);

    // Check if it currently owns it
    if (user.avatar === avatarToBuy)
        throw new HttpException(400, `User already owns ${avatarToBuy}`);

    // Check if they have enough points
    if (avatarMap[avatarToBuy].cost > user.kudos)
        throw new HttpException(400, `User does not have enough kudos to buy ${avatarToBuy}`);

    // OK to buy
    user.avatar = avatarToBuy;
    user.kudos -= avatarMap[avatarToBuy].cost;

    await user.save().catch((err) => {
        throw new HttpException(500, `Error saving user: ${err}`);
    });
    return;
};
