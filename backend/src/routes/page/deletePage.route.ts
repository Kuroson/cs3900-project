import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course.model";
import Page from "@/models/page.model";
import { verifyIdTokenValid } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";
import { checkAdmin } from "../admin/admin.route";

type ResponsePayload = {
    message?: string;
};

type QueryPayload = {
    courseId: string;
    pageId: string;
};

export const deletePageController = async (
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
        if (isValidBody<QueryPayload>(req.body, ["pageId", "courseId"])) {
            // Body has been verified
            const queryBody = req.body;

            await deletePage(queryBody, authUser.uid);

            return res.status(200).json({});
        } else {
            throw new HttpException(
                400,
                `Missing body keys: ${getMissingBodyIDs<QueryPayload>(req.body, [
                    "pageId",
                    "courseId",
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
 * Deletes the given page from the given course, deleting the page itself and
 * removes it from the course
 *
 * @param queryBody The arguments of course and page IDs to be deleted
 */
export const deletePage = async (queryBody: QueryPayload, firebase_uid: string) => {
    if (!(await checkAdmin(firebase_uid))) {
        throw new HttpException(401, "Must be an admin to get all courses");
    }

    const { courseId, pageId } = queryBody;

    const course = await Course.findById(courseId);
    if (course === null) throw new HttpException(400, "Course does not exist");

    // Remove from course and overall
    course.pages.remove(pageId);
    await course.save().catch((err) => {
        throw new HttpException(500, "Failed to remove page from course");
    });
    await Page.findByIdAndDelete(pageId);
};
