import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course.model";
import User from "@/models/user.model";
import { verifyIdTokenValid } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { Request, Response } from "express";
import { checkAdmin } from "../admin/admin.route";

type CourseInfo = {
    courseId: string;
    title: string;
    code: string;
    description: string;
    session: string;
    icon: string;
};

type ResponsePayload = {
    courses?: Array<CourseInfo>;
    message?: string;
};

type QueryPayload = Record<string, never>;

export const getCoursesController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload>,
) => {
    try {
        if (req.headers.authorization === undefined)
            throw new HttpException(405, "No authorization header found");

        // Verify token
        const token = req.headers.authorization.split(" ")[1];
        const authUser = await verifyIdTokenValid(token);

        // User has been verified
        const myCourses = await getCourses(authUser.uid);

        logger.info(`Courses: ${myCourses}`);
        return res.status(200).json({ courses: myCourses });
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
 * Finds all the courses for a given user. If this is an admin/instructor it
 * will be the courses they have created. If this is a student, this will be
 * their enrolled courses.
 *
 * @param firebase_uid ID of the user to get their available courses for
 * @returns List of the user's courses
 */
export const getCourses = async (firebase_uid: string) => {
    const isAdmin = await checkAdmin(firebase_uid);

    const courseList = new Array<CourseInfo>();

    if (isAdmin) {
        // Get created courses
        const user = await User.findOne({ firebase_uid });
        if (user === null) throw new HttpException(500, "Failed to find user");

        for (const courseId of user.created_courses) {
            const course = await Course.findById(courseId);
            if (course === null) continue;

            const courseDetails: CourseInfo = {
                courseId: course._id,
                title: course.title,
                code: course.code,
                description: "",
                session: course.session,
                icon: "",
            };

            if (course.description !== undefined) {
                courseDetails.description = course.description;
            }

            if (course.icon !== undefined) {
                courseDetails.icon = course.icon;
            }

            courseList.push(courseDetails);
        }
    } else {
        // Get enrolled courses
        const user = await User.findOne({ firebase_uid });
        if (user === null) throw new HttpException(500, "Failed to find user");

        for (const courseId of user.enrolments) {
            // Get course for info
            const course = await Course.findById(courseId);
            if (course === null) continue;

            const courseDetails: CourseInfo = {
                courseId: course._id,
                title: course.title,
                code: course.code,
                description: "",
                session: course.session,
                icon: "",
            };

            if (course.description !== undefined) {
                courseDetails.description = course.description;
            }

            if (course.icon !== undefined) {
                courseDetails.icon = course.icon;
            }

            courseList.push(courseDetails);
        }
    }

    return courseList;
};
