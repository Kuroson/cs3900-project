import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course.model";
import User from "@/models/user.model";
import { verifyIdTokenValid } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";

type ResponsePayload = {
    courseId: string;
    message?: string;
};

type QueryPayload = {
    courseId: string;
    students: Array<string>;
};

export const addStudentsController = async (
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
        if (isValidBody<QueryPayload>(req.body, ["courseId", "students"])) {
            // Body has been verified
            const queryBody = req.body;

            const courseId = await addStudents(queryBody);

            logger.info(`courseId: ${courseId}`);
            return res.status(200).json({ courseId });
        } else {
            throw new HttpException(
                400,
                `Missing body keys: ${getMissingBodyIDs<QueryPayload>(req.body, [])}`,
            );
        }
    } catch (error) {
        if (error instanceof HttpException) {
            logger.error(error.getMessage());
            logger.error(error.originalError);
            return res
                .status(error.getStatusCode())
                .json({ message: error.getMessage(), courseId: "" });
        } else {
            logger.error(error);
            return res
                .status(500)
                .json({ message: "Internal server error. Error was not caught", courseId: "" });
        }
    }
};

export const addStudents = async (queryBody: QueryPayload) => {
    const { courseId, students } = queryBody;

    const invalidStudentEmails = Array<string>();

    const course = await Course.findById(courseId);
    if (course === null) throw new Error("Failed to retrieve course");

    students.forEach((studentemail) => {
        if (User.find({ email: studentemail }) !== null) {
            course.students?.addToSet(studentemail);
        } else {
            invalidStudentEmails.push(studentemail);
        }
    });

    const retCourseId = await course
        .save()
        .then((res) => {
            return res._id;
        })
        .catch((err) => {
            return null;
        });

    if (courseId === null) {
        throw new Error("Failed to update course");
    }

    return retCourseId;
};
