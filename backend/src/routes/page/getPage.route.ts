import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course.model";
import { verifyIdTokenValid } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { Request, Response } from "express";

type ResponsePayload = {
    code?: string;
    title?: string;
    description?: string;
    session?: string;
    icon?: string;
    pages?: Array<object>;
    message?: string;
};

type QueryPayload = {
    courseCode: string;
};

export const getPageController = async (
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
        const ret_data = await getPage(req.params.courseCode);

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

export const getPage = async (courseId: string) => {
    const myCourse = await Course.findById(courseId);

    if (myCourse === null) throw new Error("Course does not exist");

    const courseInfo = {
        code: myCourse.code,
        title: myCourse.title,
        description: myCourse.description,
        session: myCourse.session,
        icon: myCourse.icon,
        pages: [], // TODO: when pages are created, update to return pages
    };

    return courseInfo;
};
