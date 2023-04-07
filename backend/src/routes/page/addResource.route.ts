import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course/course.model";
import Page from "@/models/course/page/page.model";
import Resource from "@/models/course/page/resource.model";
import Section from "@/models/course/page/section.model";
import { RecipientsType, sendEmail } from "@/utils/email";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";
import { checkAdmin } from "../admin/admin.route";
import { getStudents } from "../course/getStudents.route";

type ResponsePayload = {
    resourceId: string;
};

type QueryPayload = {
    courseId: string;
    pageId: string;
    title: string;
    sectionId: string | null;
    resourceId: string | null; // This value will exist if we are updating a resource
    description: string;
};

/**
 * PUT /page/add/resource
 * Updates or adds a new resource based on the passed in data.
 * Updates if resourceId is passed in, otherwise adds a new resource.
 * Adds a new resource to the base page unless sectionId is passed in
 * @param req
 * @param res
 * @returns
 */
export const addResourceController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const authUser = await checkAuth(req as any);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = [
            "courseId",
            "pageId",
            "title",
            "resourceId",
            "description",
            "sectionId",
        ];

        // User has been verified
        if (isValidBody<QueryPayload>(req.body, KEYS_TO_CHECK)) {
            // Body has been verified
            const queryBody = req.body;
            const resourceId = await addResource(queryBody, authUser.uid);
            logger.info(`resourceId: ${resourceId}`);
            return res.status(200).json({ resourceId });
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
 * @param queryBody The page information in the format of QueryPayload defined above
 * @throws { HttpException }
 * @returns The ID of the new resource that has been created
 */
export const addResource = async (
    queryBody: QueryPayload,
    firebase_uid: string,
    sendEmails = true,
) => {
    if (!(await checkAdmin(firebase_uid))) {
        throw new HttpException(403, "Must be an admin to add a resource");
    }

    const { courseId, pageId, sectionId, resourceId, title, description } = queryBody;

    const course = await Course.findById(courseId).catch(() => null);
    if (course === null) throw new HttpException(400, `Course of ${courseId} does not exist`);

    if (resourceId !== null) {
        // We are editing an existing resource
        const existingResource = await Resource.findById(resourceId).catch(() => null);

        if (existingResource === null)
            throw new HttpException(400, `Failed to find resource matching id ${resourceId}`);

        existingResource.title = title;
        existingResource.description = description ?? "";

        await existingResource.save().catch((err) => {
            throw new HttpException(500, "Failed to update resource", err);
        });
        return;
    }

    // Otherwise, create a new resource
    const newResource = new Resource({
        title,
        description: description ?? "",
    });

    const newResourceId = await newResource
        .save()
        .then((res) => res._id)
        .catch((err) => {
            throw new HttpException(500, "Failed to save resource", err);
        });

    // Add it to the base of the page
    if (sectionId === null) {
        // The resource goes on the base page
        const currPage = await Page.findById(pageId).catch(() => null);
        if (currPage === null) throw new HttpException(500, "Cannot retrieve section");

        currPage.resources.addToSet(newResourceId);

        await currPage.save().catch((err) => {
            throw new HttpException(500, "Failed to save updated section", err);
        });
    } else {
        // The resource goes in a section
        const currSection = await Section.findById(sectionId).catch(() => null);
        if (currSection === null)
            throw new HttpException(400, `Cannot retrieve section of ${sectionId}`);

        currSection.resources.addToSet(newResourceId);

        await currSection.save().catch((err) => {
            throw new HttpException(500, "Failed to save updated section", err);
        });
    }

    // Send an email about a new resource uploaded
    if (sendEmails) {
        const students = await getStudents(courseId);
        const recipients: RecipientsType = [];
        for (const student of students) {
            recipients.push({
                name: `${student.student.first_name} ${student.student.last_name}`,
                email: student.student.email,
            });
        }
        sendEmail(
            recipients,
            `New material added to ${course.code}`,
            "Your instructor has uploaded new material to your course. Log in to view now.",
        );
    }

    return newResourceId;
};
