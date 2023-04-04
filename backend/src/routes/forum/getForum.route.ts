import { HttpException } from "@/exceptions/HttpException";
import Course, { CourseInterface } from "@/models/course/course.model";
import Enrolment from "@/models/course/enrolment/enrolment.model";
import Forum, { ForumInterface } from "@/models/course/forum/forum.model";
import { PageInterface } from "@/models/course/page/page.model";
import { ResourceInterface } from "@/models/course/page/resource.model";
import { SectionInterface } from "@/models/course/page/section.model";
import User from "@/models/user.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";

type ResponsePayload = BasicForumInfo;

// Basically joined all the tables, contains all information about pages, sections, and resources
type BasicForumInfo = Omit<ForumInterface, "description">;

type QueryPayload = {
    courseId: string;
};

/**
 * GET /forum
 * Gets the forum from a course information. Must be enrolled in said course or be an admin
 *
 * @param req
 * @param res
 * @returns
 */
export const getForumController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["courseId"];
        if (isValidBody<QueryPayload>(req.query, KEYS_TO_CHECK)) {
            const { courseId } = req.query;

            const forumData = await getForum(courseId, authUser.uid);
            //console.log(forumData);
            return res.status(200).json({ ...forumData.toObject() });
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
 * Gets the information for a given course including its base info (title, code, etc.) and the pages
 * it contains
 *
 * @param courseId The ID of the course to be recalled
 * @param firebaseUID The firebaseUID of the user requesting the course
 * @returns Base information on the course based on return requirements in ResponsePayload
 */
export const getForum = async (courseId: string, firebaseUID: string): Promise<BasicForumInfo> => {
    // Find user first
    const user = await User.findOne({ firebase_uid: firebaseUID }).catch(() => null);
    if (user === null) throw new HttpException(400, `User of ${firebaseUID} does not exist`);

    // Check if user is enrolled in course
    const myCourse = await Course.findById(courseId)
        .select("_id title forum code description session icon pages tags")
        .populate("forum")
        .populate({
            path: "forum",
            populate: { path: "posts" },
        })
        .exec()
        .catch(() => null);

    if (myCourse === null) throw new HttpException(400, `Course of ${courseId} does not exist`);

    // Try and find enrolment
    const enrolment = await Enrolment.find({ student: user._id, course: courseId });
    if (enrolment === null && user.role !== 0)
        throw new HttpException(400, "User is not enrolled in course");

    return myCourse.forum as BasicForumInfo;
};
