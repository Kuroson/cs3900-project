import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course/course.model";
import Page from "@/models/course/page/page.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";
import { checkAdmin } from "../admin/admin.route";

type ResponsePayload = {
    pageId: string;
};

type QueryPayload = {
    courseId: string;
    title: string;
};

/**
 * POST /page/create
 * Create a new page
 * @param req
 * @param res
 * @returns
 */
export const createPageController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["title", "courseId"];

        // User has been verified
        if (isValidBody<QueryPayload>(req.body, KEYS_TO_CHECK)) {
            // Body has been verified
            const { courseId, title } = req.body;

            const pageId = await createPage(courseId, title, authUser.uid);

            logger.info(`pageId: ${pageId}`);
            return res.status(200).json({ pageId });
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
 * Creates a new page in the given course with the information specified
 * @param queryBody The page information in the format of QueryPayload defined above
 * @throws { HttpException } if not admin or if courseId is not valid
 * @returns The ID of the new page that has been created
 */
export const createPage = async (
    courseId: string,
    title: string,
    firebase_uid: string,
): Promise<string> => {
    if (!(await checkAdmin(firebase_uid))) {
        throw new HttpException(403, "Must be an admin to create a page");
    }

    const course = await Course.findById(courseId).catch(() => null);
    if (course === null) throw new HttpException(400, `Course, ${courseId}, does not exist`);

    const myPage = new Page({
        title: title,
        sections: [],
        resources: [],
    });

    const pageId = await myPage
        .save()
        .then((res) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return res._id;
        })
        .catch((err) => {
            throw new HttpException(500, "Failed to create page", err);
        });

    // Add page to course
    course.pages.push(pageId);

    await course.save().catch((err) => {
        throw new HttpException(500, "Failed to add page to course", err);
    });

    return pageId.toString() as string;
};
