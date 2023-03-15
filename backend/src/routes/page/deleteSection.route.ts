import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course.model";
import Page from "@/models/page.model";
import Section from "@/models/section.model";
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
    sectionId: string;
};

export const deleteSectionController = async (
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
        if (isValidBody<QueryPayload>(req.body, ["courseId", "pageId", "sectionId"])) {
            // Body has been verified
            const queryBody = req.body;

            await deleteSection(queryBody, authUser.uid);

            return res.status(200).json({});
        } else {
            throw new HttpException(
                400,
                `Missing body keys: ${getMissingBodyIDs<QueryPayload>(req.body, [
                    "courseId",
                    "pageId",
                    "sectionId",
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
 * Adds a new section to a page on the course
 *
 * @param queryBody The section information in the format of QueryPayload defined above
 * @returns The ID of the new section that has been created
 */
export const deleteSection = async (queryBody: QueryPayload, firebase_uid: string) => {
    if (!(await checkAdmin(firebase_uid))) {
        throw new HttpException(401, "Must be an admin to add a resource");
    }

    const { courseId, pageId, sectionId } = queryBody;

    // Remove from page
    const currPage = await Page.findById(pageId);
    if (currPage === null) throw new HttpException(500, "Failed to fetch page");

    currPage.sections.remove(sectionId);

    await currPage.save().catch((err) => {
        throw new HttpException(500, "Failed to remove from page");
    });

    // Remove section
    await Section.findByIdAndDelete(sectionId).catch((err) => {
        throw new HttpException(500, "Failed to delete section");
    });
};
