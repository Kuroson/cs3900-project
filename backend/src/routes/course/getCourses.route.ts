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

export const getCourses = async (firebase_uid: string) => {
    const isAdmin = await checkAdmin(firebase_uid);

    const courseList = new Array<CourseInfo>();

    if (isAdmin) {
        // Get all courses
        const allCourses = await Course.find();

        for (const course of allCourses) {
            const courseDetails = {
                courseId: course._id,
                title: course.title,
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
        if (user === null) throw new Error("Failed to find user");

        for (const courseId of user.enrolments) {
            // Get course for info
            const course = await Course.findById(courseId);
            if (course === null) continue;

            const courseDetails = {
                courseId: course._id,
                title: course.title,
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
