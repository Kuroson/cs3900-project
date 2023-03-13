import { HttpException } from "@/exceptions/HttpException";
import Page from "@/models/page.model";
import Resource from "@/models/resource.model";
import Section from "@/models/section.model";
import { recallFileUrl, verifyIdTokenValid } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { Request, Response } from "express";

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
    title?: string;
    resources?: Array<ResponseResourceInfo>;
    sections?: Array<ResponseSectionInfo>;
    message?: string;
};

type QueryPayload = {
    courseId: string;
    pageId: string;
};

export const getPageController = async (
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
        // Get course id from url param
        const ret_data = await getPage(req.params.pageId, req.params.courseId);

        logger.info(ret_data);
        return res.status(200).json(ret_data);
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
 * Gets the state of a given page, returning its resources, sections and resources
 * nested within these sections. It gives base information for each and the link to
 * access download of any resource.
 *
 * @param pageId The ID of the page to get information for
 * @param courseId The course the page is located within
 * @returns The state of the page in the format defined within ResponsePayload
 */
export const getPage = async (pageId: string, courseId: string) => {
    const myPage = await Page.findById(pageId);
    if (myPage === null) throw new HttpException(500, "Failed to recall page");

    const pageInfo = {
        courseId,
        pageId,
        title: myPage.title,
        resources: new Array<ResponseResourceInfo>(),
        sections: new Array<ResponseSectionInfo>(),
    };

    // Get all resources directly on the page
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getResourcesInfo = async (resources: Iterable<any>) => {
        const resourcesInfo = new Array<ResponseResourceInfo>();

        for (const resource of resources) {
            const currResource = await Resource.findById(resource);
            if (currResource === null) throw new HttpException(500, "Failed to fetch resource");

            const { title, description, file_type, stored_name } = currResource;
            const resourceInfo: ResponseResourceInfo = {
                resourceId: currResource._id,
                title,
                description: description === undefined ? "" : description,
                fileType: "",
                linkToResource: "",
            };

            if (stored_name !== undefined && file_type !== undefined) {
                const linkToResource = await recallFileUrl(stored_name);
                resourceInfo.fileType = file_type;
                resourceInfo.linkToResource = linkToResource;
            }

            resourcesInfo.push(resourceInfo);
        }

        return resourcesInfo;
    };

    pageInfo.resources = await getResourcesInfo(myPage.resources);

    // Get all sections and accompanying resources
    for (const section of myPage.sections) {
        const currSection = await Section.findById(section);
        if (currSection === null) throw new HttpException(500, "Failed to fetch section");

        const { title } = currSection;
        const sectionInfo: ResponseSectionInfo = {
            sectionId: currSection._id,
            title,
            resources: await getResourcesInfo(currSection.resources),
        };

        pageInfo.sections.push(sectionInfo);
    }

    return pageInfo;
};
