import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course/course.model";
import OnlineClass from "@/models/course/onlineClass/onlineClass.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";
import { checkAdmin } from "../admin/admin.route";

type ResponsePayload = {
    classId: string;
};

type QueryPayload = {
    courseId: string;
    title: string;
    description: string;
    startTime: number;
    linkToClass: string;
};

/**
 * POST /class/schedule
 * Schedules a new class at a given time.
 * @param req
 * @param res
 */
export const createOnlineClassController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = [
            "courseId",
            "title",
            "description",
            "startTime",
            "linkToClass",
        ];

        if (isValidBody<QueryPayload>(req.body, KEYS_TO_CHECK)) {
            const { courseId, title, description, startTime, linkToClass } = req.body;

            if (!(await checkAdmin(authUser.uid))) {
                throw new HttpException(403, "Must be an admin to schedule a class");
            }

            const classId = await createOnlineClass(
                courseId,
                title,
                description,
                startTime,
                linkToClass,
            );

            return res.status(200).json({ classId });
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
 * Creates a new online class
 * @pre user calling this method is an admin
 * @param courseId
 * @param title
 * @param description
 * @param startTime
 * @param linkToClass
 * @throws { HttpException } courseId doesn't match an existing course or fails to save changes to database
 * @returns the id of the newly created class
 */
export const createOnlineClass = async (
    courseId: string,
    title: string,
    description: string | null,
    startTime: number,
    linkToClass: string,
): Promise<string> => {
    const course = await Course.findById(courseId).catch(() => null);
    if (course === null) throw new HttpException(400, `Course, ${courseId}, does not exist`);

    // Create new OnlineClass and Save
    const newLecture = new OnlineClass({
        title: title,
        description: description,
        startTime: startTime,
        linkToClass: linkToClass,
        running: false,
        chatMessages: [],
        chatEnabled: true, // Enabled by default
    });

    const newLectureId = await newLecture
        .save()
        .then((res) => res._id.toString() as string)
        .catch((err) => {
            throw new HttpException(500, "Failed to save new OnlineClass", err);
        });
    // Add id to course
    course.onlineClasses.addToSet(newLectureId);

    await course.save().catch((err) => {
        throw new HttpException(500, "Failed to save changes to course", err);
    });

    return newLectureId;
};
