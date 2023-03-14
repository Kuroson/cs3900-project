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
    sectionId?: string;
    message?: string;
};

type QueryPayload = {
    courseId: string;
    pageId: string;
    sectionId?: string;
    title: string;
};

export const addSectionController = async (
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
        if (isValidBody<QueryPayload>(req.body, ["courseId", "pageId", "title"])) {
            // Body has been verified
            const queryBody = req.body;

            const sectionId = await addSection(queryBody, authUser.uid);

            logger.info(`sectionId: ${sectionId}`);
            return res.status(200).json({ sectionId });
        } else {
            throw new HttpException(
                400,
                `Missing body keys: ${getMissingBodyIDs<QueryPayload>(req.body, [
                    "courseId",
                    "pageId",
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
 * Adds a new section to a page on the course
 *
 * @param queryBody The section information in the format of QueryPayload defined above
 * @returns The ID of the new section that has been created
 */
export const addSection = async (queryBody: QueryPayload, firebase_uid: string) => {
    if (!(await checkAdmin(firebase_uid))) {
        throw new HttpException(401, "Must be an admin to add a resource");
    }

    const { courseId, pageId, sectionId, title } = queryBody;

    if (sectionId !== undefined) {
        const existingSection = await Section.findById(sectionId).catch((err) => {
            throw new HttpException(500, "Failed to fetch section");
        });
        if (existingSection === null) throw new HttpException(500, "Failed to fetch section");

        existingSection.title = title;
        await existingSection.save().catch((err) => {
            throw new HttpException(500, "Failed to update section");
        });
        return;
    }

    const newSection = new Section({
        title,
    });

    const newSectionId = await newSection
        .save()
        .then((res) => {
            return res._id;
        })
        .catch((err) => {
            throw new HttpException(500, "Failed to create section");
        });

    // Add to page
    const currPage = await Page.findById(pageId);
    if (currPage === null) throw new HttpException(500, "Cannot retrieve page");

    currPage.sections.push(newSectionId);

    await currPage.save().catch((err) => {
        throw new HttpException(500, "Failed to save updated section");
    });

    const course = await Course.findById(courseId);
    if (course === null) throw new HttpException(400, "Course does not exist");

    return newSectionId;
};
