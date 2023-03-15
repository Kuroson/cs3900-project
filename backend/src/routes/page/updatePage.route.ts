import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course.model";
import Page from "@/models/page.model";
import Resource from "@/models/resource.model";
import Section, { Section as SectionType } from "@/models/section.model";
import { recallFileUrl, verifyIdTokenValid } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { Nullable, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";
import { checkAdmin } from "../admin/admin.route";
import { getPage } from "./getPage.route";

type ResponseResourceInfo = {
    resourceId: string;
    title: string;
    description: string;
    fileType: string;
    linkToResource: string;
};

type ResponseSectionInfo = {
    sectionId: string;
    title: string;
    resources: Array<ResponseResourceInfo>;
};

type ResponsePayload = {
    courseId?: string;
    pageId?: string;
    resources?: Array<ResponseResourceInfo>;
    sections?: Array<ResponseSectionInfo>;
    message?: string;
};

type QueryResourceInfo = {
    title: string;
    description?: string;
    resourceId?: string;
};

type QuerySectionInfo = {
    title: string;
    resources: Array<QueryResourceInfo>;
    sectionId?: string;
};

type QueryPayload = {
    courseId: string;
    pageId: string;
    resources: Array<QueryResourceInfo>;
    sections: Array<QuerySectionInfo>;
};

export const updatePageController = async (
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
        if (isValidBody<QueryPayload>(req.body, ["courseId", "pageId", "resources", "sections"])) {
            // Body has been verified
            const queryBody = req.body;

            const ret_data = await updatePage(queryBody, authUser.uid);

            logger.info(ret_data);
            return res.status(200).json(ret_data);
        } else {
            throw new HttpException(
                400,
                `Missing body keys: ${getMissingBodyIDs<QueryPayload>(req.body, [
                    "courseId",
                    "pageId",
                    "resources",
                    "sections",
                ])}`,
            );
        }
    } catch (error) {
        if (error instanceof HttpException) {
            logger.error(error.getMessage());
            logger.error(error.originalError);
            return res
                .status(error.getStatusCode())
                .json({ message: error.getMessage(), courseId: "" });
        } else {
            logger.error(error);
            return res
                .status(500)
                .json({ message: "Internal server error. Error was not caught", courseId: "" });
        }
    }
};

/**
 * Updates the state pf a given page
 * The arguments lay out the page in the same format that it is displayed
 * and stored. This means that the page can have resources and sections (with
 * the sections themselves containing nested resources).
 * This is called prior to files actually being uploaded. It gives the resourceIDs
 * of each file that is to be uploaded and this is passed to the upload function.
 * When it is called, each resource and section can be optionally be given an ID
 * and when given it indicates that this is an existing section or resource.
 *
 * @param queryBody Parameters for the page that are to be updated
 * @returns The state of the page in the same format passed, giving the sectionId
 * and resourceId of each section and page respectively.
 */
export const updatePage = async (queryBody: QueryPayload, firebase_uid: string) => {
    if (!(await checkAdmin(firebase_uid))) {
        throw new HttpException(401, "Must be an admin to get all courses");
    }

    const { courseId, pageId, resources, sections } = queryBody;

    const myPage = await Page.findById(pageId);
    if (myPage === null) throw new HttpException(400, "Page does not exist");

    // Move through resources and add new ones
    for (const resource of resources) {
        const { title, description, resourceId } = resource;
        if (resourceId !== undefined) continue;

        const newResource = new Resource({
            title,
        });

        if (description !== undefined) {
            newResource.description = description;
        }

        const newResourceId = await newResource
            .save()
            .then((res) => {
                return res._id;
            })
            .catch((err) => {
                throw new HttpException(500, "Failed to save resource");
            });

        myPage.resources.push(newResourceId);
    }

    // Move through sections and add new ones (and accompanying resources)
    for (const section of sections) {
        const { title, sectionId } = section;
        let currSection: SectionType | null = null;
        if (sectionId === undefined) {
            currSection = new Section({ title });
        } else {
            currSection = await Section.findById(sectionId);
            if (currSection === null) throw new HttpException(500, "Cannot retrieve section");
        }

        for (const resource of section.resources) {
            const { title, description, resourceId } = resource;
            if (resourceId !== undefined) continue;

            const newResource = new Resource({
                title,
            });

            if (description !== undefined) {
                newResource.description = description;
            }

            await newResource.save().catch((err) => {
                throw new HttpException(500, "Failed to save resource");
            });

            currSection.resources.push(newResource);
        }

        const currSectionId = await currSection
            .save()
            .then((res) => {
                return res._id;
            })
            .catch((err) => {
                throw new HttpException(500, "Failed to save section");
            });

        if (sectionId === undefined) {
            myPage.sections.push(currSectionId);
        }
    }

    // Save updated page
    await myPage.save().catch((err) => {
        throw new HttpException(500, "Failed to save page");
    });

    return await getPage(pageId, courseId);
};
