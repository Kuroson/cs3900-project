import { HttpException } from "@/exceptions/HttpException";
import Enrolment from "@/models/course/enrolment/enrolment.model";
import Post from "@/models/course/forum/post.model";
import ForumResponse from "@/models/course/forum/response.model";
import User from "@/models/user.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";
import { checkAdmin } from "../admin/admin.route";
import { FullResponseInfo } from "./../../models/course/forum/response.model";
import { getKudos } from "./../../routes/course/getKudosValues.route";

type ResponsePayload = {
    responseData: FullResponseInfo;
};

type QueryPayload = {
    postId: string;
    courseId: string;
    text: string;
};

/**
 * POST /forum/respond
 * Creates a post in the forum of a given course based on the body
 * @param req
 * @param res
 * @returns
 */
export const createResponseController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["postId", "courseId", "text"];

        // User has been verified
        if (isValidBody<QueryPayload>(req.body, KEYS_TO_CHECK)) {
            // Body has been verified
            const queryBody = req.body;

            const responseData = await createResponse(queryBody, authUser.uid);

            return res.status(200).json({ responseData });
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
 * Creates a new post in the system containing the base information in queryBody
 * The creator is set to the user who sent the request
 *
 * @param queryBody Arguments containing the fields defined above in QueryPayload
 * @param firebase_uid Unique identifier of user
 * @throws { HttpException } Invalid user in database
 * @returns
 */
export const createResponse = async (
    queryBody: QueryPayload,
    firebase_uid: string,
): Promise<FullResponseInfo> => {
    const { postId, courseId, text } = queryBody;

    // Find user first
    const user = await User.findOne({ firebase_uid: firebase_uid }).catch(() => null);
    if (user === null) throw new HttpException(400, `User of ${firebase_uid} does not exist`);

    // Check if user is enrolled in course
    const myPost = await Post.findById(postId)
        .exec()
        .catch(() => null);

    if (myPost === null) throw new HttpException(400, `Post of ${postId} does not exist`);
    const response = text;
    const poster = user._id;
    const correct = user.role === 0; //If they are admin, the post is automatically correct

    const myResponse = await new ForumResponse({
        response,
        correct,
        poster,
        timePosted: Date.now() / 1000,
    })
        .save()
        .catch((err) => {
            logger.error(err);
            throw new HttpException(500, "Failed to save new response");
        });

    myPost.responses.addToSet(myResponse._id.toString());
    await myPost.save().catch((err) => {
        throw new HttpException(500, "Failed to save updated response to post", err);
    });

    const isAdmin = await checkAdmin(firebase_uid);

    if (!isAdmin) {
        //Add kudos
        const courseKudos = await getKudos(courseId);
        user.kudos = user.kudos + courseKudos.forumPostAnswer; //myCourse.kudosValues.forumPostCreation;
        await user.save().catch((err) => {
            throw new HttpException(500, "Failed to add kudos to user", err);
        });

        //Add kudos to enrolment for dashboard info
        const enrolment = await Enrolment.findOne({
            student: user._id,
            course: courseId,
        }).catch((err) => null);
        if (enrolment === null) throw new HttpException(400, "Enrolment not found");
        enrolment.kudosEarned = enrolment.kudosEarned + courseKudos.forumPostAnswer;
        await enrolment.save().catch((err) => {
            throw new HttpException(500, "Failed to add kudos to enrolment", err);
        });
    }

    return { ...myResponse.toObject(), poster: user.toObject() };
};
