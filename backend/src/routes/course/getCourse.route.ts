import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course.model";
import Page from "@/models/page.model";
import { verifyIdTokenValid } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { Request, Response } from "express";

type PageInfo = {
    pageId: string;
    title: string;
};

type ResponsePayload = {
    code?: string;
    title?: string;
    description?: string;
    session?: string;
    icon?: string;
    pages?: Array<PageInfo>;
    message?: string;
};

type QueryPayload = {
    courseCode: string;
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
        // Get course id from url param
        const ret_data = await getCourse(req.params.courseCode);

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

/**
 * Gets the information for a given course including its base info (title, code, etc.) and the pages
 * it contains
 *
 * @param courseId The ID of the course to be recalled
 * @returns Base information on the course based on return requirements in ResponsePayload
 */
export const getCourse = async (courseId: string) => {
    const myCourse = await Course.findById(courseId);

    if (myCourse === null) throw new HttpException(500, "Course does not exist");

    const courseInfo = {
        code: myCourse.code,
        title: myCourse.title,
        description: myCourse.description,
        session: myCourse.session,
        icon: myCourse.icon,
        pages: new Array<PageInfo>(),
    };

    console.log(myCourse);

    // Get each page info
    for (const page of myCourse.pages) {
        const myPage = await Page.findById(page);
        if (myPage === null) throw new HttpException(500, "Failed to retrieve page");

        courseInfo.pages.push({
            title: myPage.title,
            pageId: myPage._id,
        });
    }

    return courseInfo;
};
