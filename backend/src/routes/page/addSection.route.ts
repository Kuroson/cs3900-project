/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course.model";
import Page from "@/models/page.model";
import Section from "@/models/section.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";
import { checkAdmin } from "../admin/admin.route";

type ResponsePayload = {
    sectionId: string;
};

type QueryPayload = {
    courseId: string;
    pageId: string;
    sectionId: string | null;
    title: string;
};

/**
 * PUT /page/add/section
 * Creates or updates a section based on the passed in data.
 * Updates if sectionId is passed in, otherwise adds a new section.
 * @param req
 * @param res
 * @returns
 */
export const addSectionController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req as any);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = [
            "courseId",
            "pageId",
            "title",
            "sectionId",
        ];

        // User has been verified
        if (isValidBody<QueryPayload>(req.body, KEYS_TO_CHECK)) {
            // Body has been verified
            const queryBody = req.body;

            const sectionId = await addSection(queryBody, authUser.uid);

            logger.info(`sectionId: ${sectionId}`);
            return res.status(200).json({ sectionId });
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
export const addSection = async (
    queryBody: QueryPayload,
    firebase_uid: string,
): Promise<string> => {
    if (!(await checkAdmin(firebase_uid))) {
        throw new HttpException(403, "Must be an admin to add a resource");
    }

    const { courseId, pageId, sectionId, title } = queryBody;

    const course = await Course.findById(courseId);
    if (course === null) throw new HttpException(400, `Cannot find course of ${courseId}`);

    const currPage = await Page.findById(pageId).catch(() => null);
    if (currPage === null) throw new HttpException(400, `Cannot find page of ${pageId}`);

    if (sectionId !== null) {
        // Section already exists
        const existingSection = await Section.findById(sectionId).catch(() => null);
        if (existingSection === null)
            throw new HttpException(400, `Failed to find section with ${sectionId}`);

        existingSection.title = title;
        await existingSection.save().catch((err) => {
            throw new HttpException(500, "Failed to update section", err);
        });
        return sectionId;
    }

    const newSection = new Section({
        title,
    });

    const newSectionId = await newSection
        .save()
        .then((res) => res._id)
        .catch((err) => {
            throw new HttpException(500, "Failed to create section", err);
        });

    // Add to page

    currPage.sections.push(newSectionId);

    await currPage.save().catch((err) => {
        throw new HttpException(500, "Failed to save updated section", err);
    });

    return newSectionId;
};
