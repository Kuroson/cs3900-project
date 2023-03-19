import { HttpException } from "@/exceptions/HttpException";
import Page from "@/models/page.model";
import Resource from "@/models/resource.model";
import Section from "@/models/section.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";
import { checkAdmin } from "../admin/admin.route";

type ResponsePayload = {
    message: string;
};

type QueryPayload = {
    courseId: string;
    pageId: string;
    sectionId: string | null;
    resourceId: string;
};

/**
 * DELETE /page/remove/resource
 * Attempts to remove a resource
 * @param req
 * @param res
 * @returns
 */
export const deleteResourceController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload>,
) => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const authUser = await checkAuth(req as any);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = [
            "courseId",
            "pageId",
            "resourceId",
            "sectionId",
        ];
        // User has been verified
        if (isValidBody<QueryPayload>(req.body, KEYS_TO_CHECK)) {
            // Body has been verified
            const queryBody = req.body;
            await deleteResource(queryBody, authUser.uid);
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
 * Adds a new resource to a given page for a course. It can optionally be added under
 * a section.
 *
 * @param queryBody The page information in the format of QueryPayload defined above
 * @returns The ID of the new resource that has been created
 */
export const deleteResource = async (
    queryBody: QueryPayload,
    firebase_uid: string,
): Promise<void> => {
    if (!(await checkAdmin(firebase_uid))) {
        throw new HttpException(403, "Must be an admin to add a resource");
    }

    const { courseId, pageId, sectionId, resourceId } = queryBody;

    const existingResource = await Resource.findById(resourceId).catch(() => null);
    if (existingResource === null)
        throw new HttpException(400, `Failed to fetch resource of ${resourceId}`);

    if (sectionId === null) {
        // Remove from page
        const currPage = await Page.findById(pageId).catch(() => null);
        if (currPage === null) throw new HttpException(400, `Failed to fetch page of ${pageId}`);

        currPage.resources.remove(resourceId);

        await currPage.save().catch((err) => {
            throw new HttpException(500, "Failed to remove from page", err);
        });
    } else {
        // Remove from section
        const currSection = await Section.findById(sectionId).catch(() => null);
        if (currSection === null)
            throw new HttpException(400, `Failed to fetch section of ${sectionId}`);

        currSection.resources.remove(resourceId);

        await currSection.save().catch((err) => {
            throw new HttpException(500, "Failed to remove from section", err);
        });
    }

    await Resource.findByIdAndDelete(resourceId).catch((err) => {
        throw new HttpException(500, "Failed to delete resource");
    });
};
