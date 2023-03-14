import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course.model";
import User from "@/models/user.model";
import { verifyIdTokenValid } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { Request, Response } from "express";

type StudentInfo = {
    email: string;
    first_name: string;
    last_name: string;
};

type ResponsePayload = {
    code?: string;
    students?: Array<StudentInfo>;
    message?: string;
};

type QueryPayload = {
    courseId: string;
};

export const getStudentsController = async (
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
        // Get course id from url param
        const ret_data = await getStudents(req.params.courseId);
        logger.info(ret_data);
        return res.status(200).json(ret_data);
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
 * @returns All students for a given courseId
 */
export const getStudents = async (courseId: string) => {
    const course = await Course.findById(courseId);

    if (course === null) throw new HttpException(500, "Course does not exist");

    const students = Array<StudentInfo>();

    const promiseList = course.students.map((student_id) => {
        return new Promise<void>(async (resolve, reject): Promise<void> => {
            const student = await User.findById(student_id);
            if (student === null) throw new HttpException(500, "Failed to retrieve student");

            const studentInfo = {
                email: student.email,
                first_name: student.first_name,
                last_name: student.last_name,
            };

            students.push(studentInfo);
            return resolve();
        });
    });

    await Promise.all(promiseList);

    return {
        code: course.code,
        students: students,
    };
};
