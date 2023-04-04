import { HttpException } from "@/exceptions/HttpException";
import Course, { CourseInterface } from "@/models/course/course.model";
import Enrolment from "@/models/course/enrolment/enrolment.model";
import { ForumInterface } from "@/models/course/forum/forum.model";
import { PostInterface } from "@/models/course/forum/post.model";
import { ResponseInterface } from "@/models/course/forum/response.model";
import { OnlineClassInterface } from "@/models/course/onlineClass/onlineClass.model";
import { PageInterface } from "@/models/course/page/page.model";
import { ResourceInterface } from "@/models/course/page/resource.model";
import { SectionInterface } from "@/models/course/page/section.model";
import User, { UserInterface } from "@/models/user.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";

type ResponsePayload = UserCourseInformation;

// Basically joined all the tables, contains all information about pages, sections, and resources
type UserCourseInformation = Omit<
    CourseInterface,
    "students" | "pages" | "creator" | "onlineClasses" | "forum"
> & {
    pages: Omit<PageInterface, "section" | "resources"> &
        {
            section: Omit<SectionInterface, "resources"> &
                {
                    resources: ResourceInterface[];
                }[];
            resources: ResourceInterface[];
        }[];
    onlineClasses: Omit<OnlineClassInterface, "chatMessages">[];
    forum: Omit<ForumInterface, "description | posts"> & {
        posts: Array<
            Omit<PostInterface, "responses" | "poster"> & {
                poster: UserInterface;
                responses: Array<
                    Omit<ResponseInterface, "poster"> & {
                        poster: UserInterface;
                    }
                >;
            }
        >;
    };
};

type QueryPayload = {
    courseId: string;
};

/**
 * GET /course
 * Gets the course's information. Must be enrolled in said course or be an admin
 *
 * NOTE: untested atm
 * @param req
 * @param res
 * @returns
 */
export const getCourseController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["courseId"];
        if (isValidBody<QueryPayload>(req.query, KEYS_TO_CHECK)) {
            const { courseId } = req.query;

            const courseData = await getCourse(courseId, authUser.uid);

            return res.status(200).json({ ...courseData });
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
export const getCourse = async (
    courseId: string,
    firebaseUID: string,
): Promise<UserCourseInformation> => {
    // Find user first
    const user = await User.findOne({ firebase_uid: firebaseUID }).catch(() => null);
    if (user === null) throw new HttpException(400, `User of ${firebaseUID} does not exist`);

    // Check if user is enrolled in course
    const myCourse = await Course.findById(courseId)
        .select("_id title code description forum session icon pages tags onlineClasses")
        .populate("pages")
        .populate({
            path: "pages",
            populate: [{ path: "resources" }, { path: "workload", populate: { path: "tasks" } }],
        })
        .populate({
            path: "pages",
            populate: {
                path: "sections",
                populate: {
                    path: "resources",
                },
            },
        })
        .populate("forum")
        .populate({
            path: "forum",
            populate: {
                path: "posts",
                populate: [{ path: "poster" }, { path: "responses", populate: { path: "poster" } }],
            },
        })
        .populate({
            path: "forum",
            populate: {
                path: "posts",
                populate: {
                    path: "poster",
                },
            },
        })
        .populate({
            path: "onlineClasses",
            select: "_id title description startTime linkToClass running",
        })
        .exec()
        .catch(() => null);

    if (myCourse === null) throw new HttpException(400, `Course of ${courseId} does not exist`);

    // Try and find enrolment
    const enrolment = await Enrolment.find({ student: user._id, course: courseId });
    if (enrolment === null && user.role !== 0)
        throw new HttpException(400, "User is not enrolled in course");

    return myCourse.toJSON() as UserCourseInformation;
};
