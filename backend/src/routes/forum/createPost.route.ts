import { HttpException } from "@/exceptions/HttpException";
import Course, { CourseInterface } from "@/models/course/course.model";
import Enrolment from "@/models/course/enrolment/enrolment.model";
import { ForumInterface } from "@/models/course/forum/forum.model";
import Post, { FullPostInfo } from "@/models/course/forum/post.model";
import User, { UserInterface } from "@/models/user.model";
import { RecipientsType, sendEmail } from "@/utils/email";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";
import { getKudos } from "../course/getKudosValues.route";
import { getStudents } from "../course/getStudents.route";

type ResponsePayload = {
    postData: FullPostInfo;
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
 * POST /forum/post
 * Creates a post in the forum of a given course based on the body
 * @param req
 * @param res
 * @returns
 */
export const createPostController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = [
            "courseId",
            "title",
            "question",
            "poster",
        ];

        // User has been verified
        if (isValidBody<QueryPayload>(req.body, KEYS_TO_CHECK)) {
            // Body has been verified
            const queryBody = req.body;
            const postData = await createPost(queryBody, authUser.uid);
            return res.status(200).json({ postData });
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
 * @returns the object of the post created
 */
export const createPost = async (
    queryBody: QueryPayload,
    firebase_uid: string,
    sendEmails = true,
): Promise<FullPostInfo> => {
    const { courseId, title, question, poster, image } = queryBody;

    // Find user first
    const user = await User.findOne({ firebase_uid: firebase_uid }).catch(() => null);
    if (user === null) throw new HttpException(400, `User of ${firebase_uid} does not exist`);

    // Check if user is enrolled in course
    type ResCourseType = Omit<CourseInterface, "forum"> & {
        forum: ForumInterface;
    };

    const myCourse: ResCourseType | null = await Course.findById(courseId)
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
        responses: [],
        timeCreated: Date.now() / 1000,
    })
        .save()
        .catch((err) => {
            logger.error(err);
            throw new HttpException(500, "Failed to save new post");
        });

    myCourse.forum.posts.addToSet(myPost._id.toString());

    await myCourse.forum.save().catch((err) => {
        throw new HttpException(500, "Failed to save updated forum post to course", err);
    });

    //Update kudos for user as they have created post
    const courseKudos = await getKudos(myCourse._id);
    user.kudos = user.kudos + courseKudos.forumPostCreation; //myCourse.kudosValues.forumPostCreation;

    await user.save().catch((err) => {
        throw new HttpException(500, "Failed to add kudos to user", err);
    });

    // NOTE: don't have to fill responses as guaranteed to be [] array

    // Send an email about a new post is added
    if (sendEmails) {
        const course = await Course.findById(courseId).catch(() => null);
        if (course === null) throw new HttpException(400, `Course of ${courseId} does not exist`);

        const students = await getStudents(courseId);
        const recipients: RecipientsType = [];
        for (const student of students) {
            recipients.push({
                name: `${student.student.first_name} ${student.student.last_name}`,
                email: student.student.email,
            });
        }
        sendEmail(
            recipients,
            `New forum post in ${course.code}`,
            "A new post has been added to the course forum. Log in to view now.",
        );
    }

    return { ...myPost.toObject(), poster: user.toObject() };
};
