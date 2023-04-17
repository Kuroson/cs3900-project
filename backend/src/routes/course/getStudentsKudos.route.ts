import { Request, Response } from "express";
import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course/course.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";

type StudentKudosInfo = {
    kudosEarned: number;
    student: { first_name: string; last_name: string; avatar: string };
};

type ResponsePayload = {
    students: Array<StudentKudosInfo>;
};

type QueryPayload = {
    courseId: string;
};

/**
 * Get /course/studentskudos
 * Returns all the student kudos for a given course in order
 * @param req
 * @param res
 * @returns
 */
export const getStudentsKudosController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["courseId"];
        // Get course id from url param

        if (isValidBody<QueryPayload>(req.query, KEYS_TO_CHECK)) {
            const { courseId } = req.query;
            const students = await getStudentsKudos(courseId);
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
 * Returns all the students in a given course in order of kudos
 * @param courseId
 * @returns
 */
export const getStudentsKudos = async (courseId: string): Promise<StudentKudosInfo[]> => {
    const course = await Course.findById(courseId, "students")
        .populate({
            path: "students",
            model: "Enrolment",
            select: "student kudosEarned",
            populate: {
                path: "student",
                model: "User",
                select: "_id first_name last_name avatar",
            },
        })
        .exec()
        .catch(() => null);

    if (course === null) throw new HttpException(400, `Course of ${courseId} does not exist`);

    const students = course.students as StudentKudosInfo[];

    students.sort((a, b) => b.kudosEarned - a.kudosEarned);

    return students;
};
