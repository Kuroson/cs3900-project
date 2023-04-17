import { Request, Response } from "express";
import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course/course.model";
import Page from "@/models/course/page/page.model";
import Week from "@/models/course/workloadOverview/week.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { getMissingBodyIDs, isValidBody } from "@/utils/util";
import { checkAdmin } from "../admin/admin.route";

type ResponsePayload = {
    message: string;
};

type QueryPayload = {
    courseId: string;
    pageId: string;
};

/**
 * DELETE /page
 * Deletes a page specified by courseId in body
 * @param req
 * @param res
 * @returns
 */
export const deletePageController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["pageId", "courseId"];
        if (isValidBody<QueryPayload>(req.body, KEYS_TO_CHECK)) {
            // Body has been verified
            const queryBody = req.body;
            await deletePage(queryBody, authUser.uid);
            return res.status(200).json({ message: "Success" });
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
 * Deletes the given page from the given course, deleting the page itself and
 * removes it from the course
 * @param queryBody The arguments of course and page IDs to be deleted
 * @throws { HttpException }
 */
export const deletePage = async (queryBody: QueryPayload, firebase_uid: string): Promise<void> => {
    if (!(await checkAdmin(firebase_uid))) {
        throw new HttpException(403, "Must be admin to delete course");
    }
    const { courseId, pageId } = queryBody;

    // Find and remove page from course
    const course = await Course.findById(courseId).catch(() => null);
    if (course === null) throw new HttpException(400, `Course of ${courseId} does not exist`);

    const page = await Page.findById(pageId).catch(() => null);
    if (page === null) throw new HttpException(400, `Cannot find page of ${pageId}`);

    await Week.findByIdAndDelete(page.workload).catch((err) => {
        throw new HttpException(
            500,
            `Could not find and delete weekly workload ${page.workload} from page`,
            err,
        );
    });

    // Remove from course and overall
    course.pages.remove(pageId);
    await course.save().catch((err) => {
        throw new HttpException(500, "Failed to remove page from course", err);
    });
    await Page.findByIdAndDelete(pageId).catch((err) => {
        throw new HttpException(500, `Failed to delete page of ${pageId}`, err);
    });
};
