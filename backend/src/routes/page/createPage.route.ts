import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course.model";
import Page from "@/models/page.model";
import { verifyIdTokenValid } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";
import { checkAdmin } from "../admin/admin.route";

type ResponsePayload = {
    pageId?: string;
    message?: string;
};

type QueryPayload = {
    courseId: string;
    title: string;
};

export const createPageController = async (
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
        if (isValidBody<QueryPayload>(req.body, ["title", "courseId"])) {
            // Body has been verified
            const queryBody = req.body;

            const pageId = await createPage(queryBody, authUser.uid);

            logger.info(`pageId: ${pageId}`);
            return res.status(200).json({ pageId });
        } else {
            throw new HttpException(
                400,
                `Missing body keys: ${getMissingBodyIDs<QueryPayload>(req.body, [
                    "courseId",
                    "title",
                ])}`,
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
 * Creates a new page in the given course with the information specified
 *
 * @param queryBody The page information in the format of QueryPayload defined above
 * @returns The ID of the new page that has been created
 */
export const createPage = async (queryBody: QueryPayload, firebase_uid: string) => {
    if (!(await checkAdmin(firebase_uid))) {
        throw new HttpException(401, "Must be an admin to create a page");
    }

    const { courseId, title } = queryBody;

    const course = await Course.findById(courseId);
    if (course === null) throw new HttpException(400, "Course does not exist");

    const myPage = new Page({
        title,
    });

    const pageId = await myPage
        .save()
        .then((res) => {
            return res._id;
        })
        .catch((err) => {
            throw new HttpException(500, "Failed to create page");
        });

    // Add page to course
    course.pages.push(pageId);

    await course.save().catch((err) => {
        throw new HttpException(500, "Failed to add page to course");
    });

    return pageId;
};
