import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course.model";
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
    code: string;
    title: string;
    session: string;
    description: string;
    icon: string;
};

export const updateCourseController = async (
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
        if (
            isValidBody<QueryPayload>(req.body, [
                "courseId",
                "code",
                "title",
                "session",
                "description",
                "icon",
            ])
        ) {
            // Body has been verified
            const queryBody = req.body;

            const courseId = await updateCourse(queryBody);

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

/**
 * Updates the specified fields within the specified course
 *
 * @param queryBody Fields that should be updated for the course in the format of
 * QueryPayload defined above
 * @returns The ID of the course updated
 */
export const updateCourse = async (queryBody: QueryPayload) => {
    const { courseId, code, title, session, description, icon } = queryBody;

    const myCourse = await Course.findById(courseId);
    if (myCourse === null) throw new HttpException(500, "Failed to retrieve course");

    myCourse.code = code;
    myCourse.title = title;
    myCourse.session = session;
    myCourse.description = description;
    myCourse.icon = icon;

    const retCourseId = await myCourse
        .save()
        .then((res) => {
            return res._id;
        })
        .catch((err) => {
            return null;
        });

    if (courseId === null) {
        throw new HttpException(500, "Failed to update course");
    }

    return retCourseId;
};
