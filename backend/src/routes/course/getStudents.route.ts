import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course/course.model";
import { UserInterface } from "@/models/user.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";

type StudentInfo = Omit<UserInterface, "enrolments" | "created_courses">;

type ResponsePayload = {
    students: Array<StudentInfo>;
};

type QueryPayload = {
    courseId: string;
};

/**
 * GET /course/students
 * Returns all the students in a given course
 * TODO Figure out who can use this method. Currently, anyone with a valid JWT token
 * @param req
 * @param res
 * @returns
 */
export const getStudentsController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["courseId"];
        // Get course id from url param

        if (isValidBody<QueryPayload>(req.query, KEYS_TO_CHECK)) {
            const { courseId } = req.query;
            const students = await getStudents(courseId);
            return res.status(200).json({ students: [...students] });
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
 * Returns all the students in a given course
 *
 * @param courseId The ID of the course to be recalled
 * @throws { HttpException } if the course doesn't exist
 * @returns All students for a given courseId
 */
export const getStudents = async (courseId: string): Promise<StudentInfo[]> => {
    // 1. Find the course
    const course = await Course.findById(courseId, "students")
        .populate("students", "_id email firebase_uid first_name last_name role avatar")
        .catch(() => null);
    if (course === null) throw new HttpException(400, `Course of ${courseId} does not exist`);
    return course.students;
};
