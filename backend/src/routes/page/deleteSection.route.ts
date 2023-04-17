import { Request, Response } from "express";
import { HttpException } from "@/exceptions/HttpException";
import Page from "@/models/course/page/page.model";
import Section from "@/models/course/page/section.model";
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
    sectionId: string;
};

/**
 * DELETE /page/remove/sect
 * Attempts to remove a section based on sectionId
 * @param req
 * @param res
 * @returns
 */
export const deleteSectionController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload>,
) => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const authUser = await checkAuth(req as any);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["courseId", "pageId", "sectionId"];

        // User has been verified
        if (isValidBody<QueryPayload>(req.body, KEYS_TO_CHECK)) {
            // Body has been verified
            const queryBody = req.body;
            await deleteSection(queryBody, authUser.uid);
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
 * Adds a new section to a page on the course
 * @param queryBody The section information in the format of QueryPayload defined above
 * @throws { HttpException }
 * @returns The ID of the new section that has been created
 */
export const deleteSection = async (queryBody: QueryPayload, firebase_uid: string) => {
    if (!(await checkAdmin(firebase_uid))) {
        throw new HttpException(403, "Must be an admin to add a resource");
    }

    const { courseId, pageId, sectionId } = queryBody;

    // Remove from page
    const currPage = await Page.findById(pageId);
    if (currPage === null) throw new HttpException(400, `Failed to fetch page of ${pageId}`);

    currPage.sections.remove(sectionId);

    // NOTE: doesn't clean up dependents

    await currPage.save().catch((err) => {
        throw new HttpException(500, "Failed to remove from page", err);
    });

    // Remove section
    await Section.findByIdAndDelete(sectionId).catch((err) => {
        throw new HttpException(500, "Failed to delete section", err);
    });
};
