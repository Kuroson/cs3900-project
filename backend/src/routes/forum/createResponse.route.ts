import { HttpException } from "@/exceptions/HttpException";
import Post from "@/models/course/forum/post.model";
import ForumResponse from "@/models/course/forum/response.model";
import User from "@/models/user.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";

type ResponsePayload = {
    responseId: string;
};

type QueryPayload = {
    postId: string;
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
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["postId", "text"];

        // User has been verified
        if (isValidBody<QueryPayload>(req.body, KEYS_TO_CHECK)) {
            // Body has been verified
            const queryBody = req.body;

            const responseId = await createResponse(queryBody, authUser.uid);

            return res.status(200).json({ responseId });
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
 * @returns The ID of the post that has been created
 */
export const createResponse = async (queryBody: QueryPayload, firebase_uid: string) => {
    const { postId, text } = queryBody;

    // Find user first
    const user = await User.findOne({ firebase_uid: firebase_uid }).catch(() => null);
    if (user === null) throw new HttpException(400, `User of ${firebase_uid} does not exist`);

    // Check if user is enrolled in course
    const myPost = await Post.findById(postId)
        .select("_id responses")
        .populate("responses")
        .exec()
        .catch(() => null);

    if (myPost === null) throw new HttpException(400, `Post of ${postId} does not exist`);
    const response = text;
    const poster = user._id;
    const correct = false;
    const myResponse = await new ForumResponse({
        response,
        correct,
        poster,
    })
        .save()
        .catch((err) => {
            logger.error(err);
            throw new HttpException(500, "Failed to save new response");
        });

    myPost.responses.addToSet(myResponse._id.toString());
    await myPost.save().catch((err) => {
        throw new HttpException(500, "Failed to save updated response to post");
    });

    return myResponse._id;
};
