import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course.model";
import User from "@/models/user.model";
import { verifyIdTokenValid } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";
import { getUserDetails } from "../user/userDetails.route";

type ResponsePayload = {
    invalidEmails: Array<string>;
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
        logger.info("yes");
        if (req.headers.authorization === undefined)
            throw new HttpException(405, "No authorization header found");

        // Verify token
        const token = req.headers.authorization.split(" ")[1];
        const authUser = await verifyIdTokenValid(token);

        // User has been verifiedyyy
        if (isValidBody<QueryPayload>(req.body, ["courseId", "students"])) {
            // Body has been verified
            const queryBody = req.body;

            const invalidEmailsres = await addStudents(queryBody);

            logger.info(`invalidEmails: ${invalidEmailsres}`);
            return res.status(200).json({ invalidEmails: invalidEmailsres });
        } else {
            throw new HttpException(
                400,
                `Missing body keys: ${getMissingBodyIDs<QueryPayload>(req.body, [
                    "courseId",
                    "students",
                ])}`,
            );
        }
    } catch (error) {
        if (error instanceof HttpException) {
            logger.error(error.getMessage());
            logger.error(error.originalError);
            return res
                .status(error.getStatusCode())
                .json({ message: error.getMessage(), invalidEmails: [""] });
        } else {
            logger.error(error);
            return res.status(500).json({
                message: "Internal server error. Error was not caught",
                invalidEmails: [""],
            });
        }
    }
};

export const addStudents = async (queryBody: QueryPayload) => {
    const { courseId, students } = queryBody;

    const invalidStudentEmails = Array<string>();

    const course = await Course.findById(courseId);
    if (course === null) throw new HttpException(400, "Failed to retrieve course");

    const promiseList = students.map((studentemail) => {
        return new Promise<void>(async (resolve, reject): Promise<void> => {
            const user = await User.findOne({ email: studentemail });

            if (user !== null) {
                course.students.addToSet(user._id);
                user.enrolments.addToSet(course._id);
                await user.save().catch((err) => {
                    throw new HttpException(500, "Failed to update course");
                });
            } else {
                invalidStudentEmails.push(studentemail);
            }
            return resolve();
        });
    });

    await Promise.all(promiseList);

    await course.save().catch((err) => {
        throw new HttpException(500, "Failed to update course");
    });

    return invalidStudentEmails;
};
