import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course/course.model";
import Page from "@/models/course/page/page.model";
import WorkloadOverview from "@/models/course/workloadOverview/WorkloadOverview.model";
import Week from "@/models/course/workloadOverview/week.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";
import { checkAdmin } from "../admin/admin.route";

type ResponsePayload = {
    weekId: string;
};

type QueryPayload = {
    courseId: string;
    pageId: string;
    title: string;
    description: string;
    deadline: string;
};

/**
 * POST /workload/week/create
 * Creates a new week within a given workload Overview
 * @param req
 * @param res
 * @returns
 */
export const createWeekController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = [
            "courseId",
            "pageId",
            "title",
            "description",
            "deadline",
        ];

        // User has been verified
        if (isValidBody<QueryPayload>(req.body, KEYS_TO_CHECK)) {
            // Body has been verified
            const { courseId, pageId, title, description, deadline } = req.body;

            const weekId = await createWeek(
                courseId,
                pageId,
                title,
                description,
                deadline,
                authUser.uid,
            );

            logger.info(`weekId: ${weekId}`);
            return res.status(200).json({ weekId });
        } else {
            throw new HttpException(
                400,
                `Missing body keys: ${getMissingBodyIDs<QueryPayload>(req.body, KEYS_TO_CHECK)}`,
            );
        }
    } catch (error) {
        if (error instanceof HttpException) {
            return res.status(error.getStatusCode()).json({ message: error.getMessage() });
        } else {
            logger.error(error);
            return res.status(500).json({ message: "Internal server error. Error was not caught" });
        }
    }
};

/**
 * Creates a new Week in the given workload overview
 * @param courseId
 * @param pageId
 * @param title
 * @param description
 * @param firebase_uid
 * @returns
 */
export const createWeek = async (
    courseId: string,
    pageId: string,
    title: string,
    description: string,
    deadline: string,
    firebase_uid: string,
): Promise<string> => {
    if (!(await checkAdmin(firebase_uid))) {
        throw new HttpException(403, "Must be an admin to create a week for workload overview");
    }

    // Get the course
    const course = await Course.findById(courseId).catch(() => null);
    if (course === null) {
        throw new HttpException(400, `Course, ${courseId}, does not exist`);
    }

    // Get the Page
    const page = await Page.findById(pageId).catch(() => null);
    if (page === null) {
        throw new HttpException(400, `Page, ${pageId}, does not exist`);
    }

    if (page.workload !== undefined) {
        throw new HttpException(400, `Page, ${pageId}, already contains a workload to do list`);
    }

    // Get the workload Overview
    const workloadOverview = await WorkloadOverview.findById(course.workloadOverview).catch(
        () => null,
    );
    if (workloadOverview == null) {
        throw new HttpException(
            400,
            `Workload Overview, ${course.workloadOverview}, does not exist`,
        );
    }

    console.log(deadline);

    const newWeek = new Week({
        title: title,
        description: description,
        deadline: deadline,
        tasks: [],
    });

    const weekId = await newWeek
        .save()
        .then((res) => {
            return res._id;
        })
        .catch((err) => {
            throw new HttpException(500, "Failed to create week", err);
        });

    // Add week to the workload Overview
    workloadOverview.weeks.push(weekId);

    await workloadOverview.save().catch((err) => {
        throw new HttpException(500, "Failed to add week to workload overview for course", err);
    });

    // Save Week Workload Overview to the page
    page.workload = newWeek._id;

    await page.save().catch((err) => {
        throw new HttpException(500, "Failed to save week workload to the page", err);
    });

    return weekId.toString();
};
