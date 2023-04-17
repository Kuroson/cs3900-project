import { Request, Response } from "express";
import { HttpException } from "@/exceptions/HttpException";
import Course, { CourseInterface } from "@/models/course/course.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload } from "@/utils/util";
import { checkAdmin } from "../admin/admin.route";

type ResponsePayload = {
    courses: Array<CourseInterface>;
};

type QueryPayload = Record<string, never>;

/**
 * GET course/all
 * Gets all the courses in the system. User must be an admin
 * @param req
 * @param res
 * @returns
 */
export const getAllCoursesController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);

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
 * @throws { HttpException } User is not an admin
 * @returns List of the user's courses
 */
export const getAllCourses = async (firebase_uid: string): Promise<CourseInterface[]> => {
    if (!(await checkAdmin(firebase_uid))) {
        throw new HttpException(403, "Must be an admin to get all courses");
    }
    const allCourses = await Course.find();
    return allCourses;
};
