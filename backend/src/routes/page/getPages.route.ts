import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course.model";
import { PageInterface } from "@/models/page.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";

type ResponsePayload = {
    pages: Array<PageInterface>;
};

type QueryPayload = {
    courseId: string;
};

/**
 * GET /page
 * Get the pages of courseId
 * @param req
 * @param res
 * @returns
 */
export const getPagesController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["courseId"];

        if (isValidBody<QueryPayload>(req.query, KEYS_TO_CHECK)) {
            const { courseId } = req.query;
            const myPages = await getPages(courseId);

            return res.status(200).json({ pages: myPages });
        } else {
            throw new HttpException(
                400,
                `Missing body keys: ${getMissingBodyIDs<QueryPayload>(req.query, KEYS_TO_CHECK)}`,
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
 * Gets all the pages that exist in the given course with their IDs and base information
 *
 * @param courseId The ID of the course to get the pages of
 * @returns A list of all pages and their base information
 */
export const getPages = async (courseId: string): Promise<PageInterface[]> => {
    const myCourse = await Course.findById(courseId, "_id pages")
        .populate("pages")
        .exec()
        .catch((err) => null);
    if (myCourse === null) throw new HttpException(400, "Course does not exist");
    return myCourse.pages;
};
