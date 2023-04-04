import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course/course.model";
import Enrolment from "@/models/course/enrolment/enrolment.model";
import Post from "@/models/course/forum/post.model";
import User from "@/models/user.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";

type ResponsePayload = {
    postId: string;
};

//TODO add image
type QueryPayload = {
    courseId: string;
    title: string;
    question: string;
    poster: string;
    image?: string;
};

/**
 * GET /forum/post
 * Creates a post in the forum of a given course based on the body
 * @param req
 * @param res
 * @returns
 */
export const createPostController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    console.log("Starting to create");
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = [
            "courseId",
            "title",
            "question",
            "poster",
        ];
        console.log("checked keys");

        // User has been verified
        if (isValidBody<QueryPayload>(req.body, KEYS_TO_CHECK)) {
            console.log("body valid");

            // Body has been verified
            const queryBody = req.body;

            const postId = await createPost(queryBody, authUser.uid);
            console.log("created post");

            console.log(` ************************** postId: ${postId}`);
            return res.status(200).json({ postId });
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
export const createPost = async (queryBody: QueryPayload, firebase_uid: string) => {
    const { courseId, title, question, poster, image } = queryBody;

    // Find user first
    const user = await User.findOne({ firebase_uid: firebase_uid }).catch(() => null);
    if (user === null) throw new HttpException(400, `User of ${firebase_uid} does not exist`);

    // Check if user is enrolled in course
    const myCourse = await Course.findById(courseId)
        .select("_id title code description forum session icon pages tags")
        .populate("forum")
        .exec()
        .catch(() => null);

    if (myCourse === null) throw new HttpException(400, `Course of ${courseId} does not exist`);

    // Try and find enrolment
    const enrolment = await Enrolment.find({ student: user._id, course: courseId });
    if (enrolment === null && user.role !== 0)
        throw new HttpException(400, "User is not enrolled in course");

    const myPost = await new Post({
        title,
        question,
        poster,
        courseId,
        image,
    })
        .save()
        .catch((err) => {
            logger.error(err);
            throw new HttpException(500, "Failed to save new post");
        });

    myCourse.forum.posts.addToSet(myPost._id.toString());
    console.log("hehe");

    await myCourse.forum.save().catch((err) => {
        throw new HttpException(500, "Failed to save updated forum post to course");
    });

    return myPost._id;
};
