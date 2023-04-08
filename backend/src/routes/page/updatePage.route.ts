import { HttpException } from "@/exceptions/HttpException";
import Page from "@/models/course/page/page.model";
import Resource from "@/models/course/page/resource.model";
import Section, { SectionInterface } from "@/models/course/page/section.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";
import { checkAdmin } from "../admin/admin.route";
import { PageData, getPage } from "../course/getCoursePage.route";

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

type ResponsePayload = PageData & {
    courseId: string;
    pageId: string;
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

/**
 * PUT /page/update
 * Update a page with new details
 * @param req
 * @param res
 * @returns
 */
export const updatePageController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const authUser = await checkAuth(req as any);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = [
            "courseId",
            "pageId",
            "resources",
            "sections",
        ];

        // User has been verified
        if (isValidBody<QueryPayload>(req.body, KEYS_TO_CHECK)) {
            // Body has been verified
            const queryBody = req.body;
            const data = await updatePage(queryBody, authUser.uid);
            return res.status(200).json({
                courseId: queryBody.courseId,
                pageId: queryBody.pageId,
                ...data,
            });
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
 * @throws { HttpException } if user is not admin or pageId is invalid
 * @returns The state of the page in the same format passed, giving the sectionId
 * and resourceId of each section and page respectively.
 */
export const updatePage = async (
    queryBody: QueryPayload,
    firebase_uid: string,
): Promise<PageData> => {
    if (!(await checkAdmin(firebase_uid))) {
        throw new HttpException(403, "Must be an admin to update page");
    }

    const { courseId, pageId, resources, sections } = queryBody;

    const myPage = await Page.findById(pageId).catch(() => null);
    if (myPage === null) throw new HttpException(400, `Page of ${pageId} does not exist`);

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
            .then((res) => res._id)
            .catch((err) => {
                throw new HttpException(500, "Failed to save resource", err);
            });

        myPage.resources.push(newResourceId);
    }

    // Move through sections and add new ones (and accompanying resources)
    for (const section of sections) {
        const { title, sectionId } = section;
        let currSection: SectionInterface | null = null;
        if (sectionId === undefined) {
            currSection = new Section({ title });
        } else {
            currSection = await Section.findById(sectionId).catch(() => null);
            if (currSection === null)
                throw new HttpException(400, `Cannot retrieve section of ${sectionId}`);
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
                throw new HttpException(500, "Failed to save resource", err);
            });

            currSection.resources.push(newResource);
        }

        const currSectionId = await currSection
            .save()
            .then((res) => res._id)
            .catch((err) => {
                throw new HttpException(500, "Failed to save section", err);
            });

        if (sectionId === undefined) {
            myPage.sections.push(currSectionId);
        }
    }

    // Save updated page
    await myPage.save().catch((err) => {
        throw new HttpException(500, "Failed to save page", err);
    });

    return await getPage(pageId, courseId);
};
