import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course.model";
import Page from "@/models/page.model";
import Resource from "@/models/resource.model";
import Section from "@/models/section.model";
import { verifyIdTokenValid } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";
import { checkAdmin } from "../admin/admin.route";

type ResponsePayload = {
    resourceId?: string;
    message?: string;
};

type QueryPayload = {
    courseId: string;
    pageId: string;
    sectionId?: string;
    title: string;
    description?: string;
};

export const addResourceController = async (
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
        if (isValidBody<QueryPayload>(req.body, ["courseId", "pageId", "title", "description"])) {
            // Body has been verified
            const queryBody = req.body;

            const resourceId = await addResource(queryBody, authUser.uid);

            logger.info(`resourceId: ${resourceId}`);
            return res.status(200).json({ resourceId });
        } else {
            throw new HttpException(
                400,
                `Missing body keys: ${getMissingBodyIDs<QueryPayload>(req.body, [
                    "courseId",
                    "pageId",
                    "title",
                    "description",
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
 * Adds a new resource to a given page for a course. It can optionally be added under
 * a section.
 *
 * @param queryBody The page information in the format of QueryPayload defined above
 * @returns The ID of the new resource that has been created
 */
export const addResource = async (queryBody: QueryPayload, firebase_uid: string) => {
    if (!(await checkAdmin(firebase_uid))) {
        throw new HttpException(401, "Must be an admin to add a resource");
    }

    const { courseId, pageId, sectionId, title, description } = queryBody;

    const newResource = new Resource({
        title,
    });

    if (description !== undefined) {
        newResource.description = description;
    }

    const resourceId = await newResource
        .save()
        .then((res) => {
            return res._id;
        })
        .catch((err) => {
            throw new HttpException(500, "Failed to save resource");
        });

    if (sectionId === undefined) {
        // The resource goes on the base page
        const currPage = await Page.findById(pageId);
        if (currPage === null) throw new HttpException(500, "Cannot retrieve section");

        currPage.resources.push(resourceId);

        await currPage.save().catch((err) => {
            throw new HttpException(500, "Failed to save updated section");
        });
    } else {
        // The resource goes in a section
        const currSection = await Section.findById(sectionId);
        if (currSection === null) throw new HttpException(500, "Cannot retrieve section");

        currSection.resources.push(resourceId);

        await currSection.save().catch((err) => {
            throw new HttpException(500, "Failed to save updated section");
        });
    }

    const course = await Course.findById(courseId);
    if (course === null) throw new HttpException(400, "Course does not exist");

    return resourceId;
};
