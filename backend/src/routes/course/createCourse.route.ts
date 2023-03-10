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
    code: string;
    title: string;
    session: string;
    description: string;
    icon: string;
};

export const createCourseController = async (
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
            isValidBody<QueryPayload>(req.body, ["code", "title", "session", "description", "icon"])
        ) {
            // Body has been verified
            const queryBody = req.body;

            const courseId = await createCourse(queryBody, authUser.uid);

            logger.info(`courseId: ${courseId}`);
            return res.status(200).json({ courseId });
        } else {
            throw new HttpException(
                400,
                `Missing body keys: ${getMissingBodyIDs<QueryPayload>(req.body, [
                    "code",
                    "title",
                    "session",
                    "description",
                    "icon",
                ])}`,
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

export const createCourse = async (queryBody: QueryPayload, firebase_uid: string) => {
    const { code, title, session, description, icon } = queryBody;

    const adminId = await User.findOne({ firebase_uid })
        .then((res) => {
            if (res === null) {
                throw new Error("Invalid user in database");
            }
            return res._id;
        })
        .catch((err) => {
            throw new Error("Invalid user in database");
        });

    const myCourse = new Course({
        title,
        code,
        description,
        session,
        icon,
        creator: adminId,
    });

    const courseId = await myCourse
        .save()
        .then((res) => {
            return res._id;
        })
        .catch((err) => {
            return null;
        });

    if (courseId === null) {
        throw new Error("Failed to create course");
    }

    return courseId;
};