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
 * PUT /course/students/remove
 * Remove students from a course. Must be an admin to use
 * @param req
 * @param res
 * @returns
 */
export const removeStudentsController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const authUser = await checkAuth(req as any); // Idk why ts is freaking out lol
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["courseId", "studentEmails"];

        if (isValidBody<QueryPayload>(req.body, KEYS_TO_CHECK)) {
            const { courseId, studentEmails } = req.body;

            const invalidEmails = await removeStudents(courseId, studentEmails, authUser.uid);

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
            return res.status(error.getStatusCode()).json({ message: error.getMessage() });
        } else {
            logger.error(error);
            return res.status(500).json({ message: "Internal server error. Error was not caught" });
        }
    }
};

/**
 * Attempts to remove all students from the matching course
 * @param courseId course to remove from
 * @param studentEmails emails to remove
 * @param firebaseUID requester's id
 * @returns list of emails that failed to be removed
 */
export const removeStudents = async (
    courseId: string,
    studentEmails: string[],
    firebaseUID: string,
): Promise<string[]> => {
    // 1. Validate if user is an admin
    if (!(await checkAdmin(firebaseUID))) {
        throw new HttpException(403, "User is not an admin. Unauthorized");
    }

    // 2. Find the course matching courseId
    const invalidEmails = Array<string>();

    const course = await Course.findById(courseId).catch(() => null);
    if (course === null) throw new HttpException(400, `Failed to retrieve course of ${courseId}`);

    // 3. Try and remove all students from the course
    const promiseList = studentEmails.map((email) => {
        return new Promise<void>(async (resolve, reject): Promise<void> => {
            const user = await User.findOne({ email: email });
            if (user !== null) {
                // Get enrolment related to this user-course combination
                const enrolment = await Enrolment.findOne({
                    student: user._id,
                    course: course._id,
                });
                if (enrolment === null) {
                    // Just add to invalidEmails
                    invalidEmails.push(email);
                    logger.error(`Failed to update enrolments for ${email}.`);
                    return resolve();
                }
                course.students.pull(enrolment._id);
                user.enrolments.pull(enrolment._id);

                await user.save().catch((err) => {
                    // throw new HttpException(500, "Failed to update specific user", err);
                    // Just add to invalidEmails
                    invalidEmails.push(email);
                    logger.error(`Failed to update enrolments for ${email}.`);
                    logger.error(err);
                });

                // Delete enrolment
                await enrolment.delete().catch((err) => {
                    // throw new HttpException(500, "Failed to delete enrolment", err);
                    // Just add to invalidEmails
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
