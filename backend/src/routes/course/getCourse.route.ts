import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course.model";
import User from "@/models/user.model";
import { verifyIdTokenValid } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";

type ResponsePayload = {
    code?: string;
    title?: string;
    description?: string;
    session?: string;
    icon?: string;
    pages?: any;
    message?: string;
};

type QueryPayload = {
    courseId: string;
};

export const getCourseController = async (
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
        if (isValidBody<QueryPayload>(req.body, ["courseId"])) {
            // Body has been verified
            const queryBody = req.body;

            const ret_data = await getCourse(queryBody, authUser.uid);

            logger.info(ret_data);
            return res.status(200).json(ret_data);
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
            return res.status(error.getStatusCode()).json({ message: error.getMessage() });
        } else {
            logger.error(error);
            return res.status(500).json({ message: "Internal server error. Error was not caught" });
        }
    }
};

export const getCourse = async (queryBody: QueryPayload, firebase_uid: string) => {
    const { courseId } = queryBody;

    const myCourse = await Course.findById(courseId);

    if (myCourse === null) throw new Error("Course does not exist");

    let courseInfo = {
        code: myCourse.code,
        title: myCourse.title,
        description: myCourse.description,
        session: myCourse.session,
        icon: myCourse.icon,
        pages: [], // TODO: when pages are created, update to return pages
    };

    return courseInfo;
};
