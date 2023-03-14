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

export const getAllCoursesController = async (
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
        const myCourses = await getAllCourses(authUser.uid);

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
 * Finds all the courses within the system. This is only callable if the user is
 * and admin.
 *
 * @param firebase_uid ID of the user to get their available courses for
 * @returns List of the user's courses
 */
export const getAllCourses = async (firebase_uid: string) => {
    if (!(await checkAdmin(firebase_uid))) {
        throw new HttpException(401, "Must be an admin to get all courses");
    }

    const courseList = new Array<CourseInfo>();

    const allCourses = await Course.find();

    for (const course of allCourses) {
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

    return courseList;
};
