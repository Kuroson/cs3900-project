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
    pages?: Array<PageInfo>;
    message?: string;
};

type QueryPayload = {
    courseId: string;
};

export const getPagesController = async (
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
        const myPages = await getPages(req.params.courseId);

        logger.info(`Pages: ${myPages}`);
        return res.status(200).json({ pages: myPages });
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
 * Gets all the pages that exist in the given course with their IDs and base information
 *
 * @param courseId The ID of the course to get the pages of
 * @returns A list of all pages and their base information
 */
export const getPages = async (courseId: string) => {
    const pageList = new Array<PageInfo>();

    const myCourse = await Course.findById(courseId);
    if (myCourse === null) throw new HttpException(400, "Course does not exist");

    for (const pageId of myCourse.pages) {
        const page = await Page.findById(pageId);
        if (page === null) continue;

        pageList.push({
            pageId: page._id,
            title: page.title,
        });
    }

    return pageList;
};
