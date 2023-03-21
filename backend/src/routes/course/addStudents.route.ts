import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course/course.model";
import Enrolment from "@/models/course/enrolment/enrolment.model";
import User from "@/models/user.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";
import { checkAdmin } from "../admin/admin.route";

type ResponsePayload = {
    invalidEmails: Array<string>;
};

type QueryPayload = {
    courseId: string;
    studentEmails: Array<string>;
};

/**
 * PUT /course/students/add
 * Adds students to a course. Must be an admin to use
 * @param req
 * @param res
 * @returns
 */
export const addStudentsController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const authUser = await checkAuth(req as any); // Idk why ts is freaking out lol
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["courseId", "studentEmails"];

        if (isValidBody<QueryPayload>(req.body, KEYS_TO_CHECK)) {
            // Body has been verified
            const { courseId, studentEmails } = req.body;
            const invalidEmails = await addStudents(courseId, studentEmails, authUser.uid);

            logger.info(`Invalid Emails: ${invalidEmails}`);
            return res.status(200).json({ invalidEmails: invalidEmails });
        } else {
            throw new HttpException(
                400,
                `Missing body keys: ${getMissingBodyIDs<QueryPayload>(req.body, KEYS_TO_CHECK)}`,
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
            return res.status(500).json({ message: "Internal server error. Error was not caught" });
        }
    }
};

/**
 * Attempts to add all students to the matching course
 * @param courseId course to add to
 * @param studentEmails emails of students to add
 * @param firebaseUID requester's id
 * @throws { HttpException } if user is not an admin or if courseId doesn't exist
 * @returns list of emails failed to be added
 */
export const addStudents = async (courseId, studentEmails, firebaseUID): Promise<string[]> => {
    // 1. Validate if user is an admin
    if (!(await checkAdmin(firebaseUID))) {
        throw new HttpException(403, "User is not an admin. Unauthorized");
    }

    // 2. Find the course matching courseId
    const course = await Course.findOne({ _id: courseId }).catch(() => null);
    if (course === null) throw new HttpException(400, `Failed to retrieve course of ${courseId}`);

    // 3. Try and add all students to the course
    const invalidEmails: string[] = [];

    const promiseList = studentEmails.map((email) => {
        return new Promise<void>(async (resolve, reject): Promise<void> => {
            const user = await User.findOne({ email: email });

            if (user !== null) {
                // TODO: check if the enrolment already exists
                const enrolment = await Enrolment.findOne({
                    student: user._id,
                    course: course._id,
                });
                if (enrolment !== null) {
                    // Student is already enrolled
                    return resolve();
                }

                // Create new enrolment
                await new Enrolment({
                    student: user._id,
                    course: course._id,
                })
                    .save()
                    .then(async (res) => {
                        course.students.addToSet(res._id);
                        user.enrolments.addToSet(res._id);
                        await user.save().catch((err) => {
                            // Add to invalidEmails
                            invalidEmails.push(email);
                            logger.error(`Failed to update enrolments for ${email}.`);
                            logger.error(err);
                        });
                    })
                    .catch((err) => {
                        // Add to invalidEmails
                        invalidEmails.push(email);
                        logger.error(`Failed to update enrolments for ${email}.`);
                        logger.error(err);
                    });
            } else {
                invalidEmails.push(email);
            }
            return resolve();
        });
    });
    await Promise.all(promiseList);
    await course.save().catch((err) => {
        throw new HttpException(500, "Failed to update course", err);
    });
    return invalidEmails;
};
