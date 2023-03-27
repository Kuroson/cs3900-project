import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course/course.model";
import WorkloadOverview from "@/models/course/workloadOverview/WorkloadOverview.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";
import { checkAdmin } from "../admin/admin.route";

type ResponsePayload = {
    workloadOverviewId: string;
};

type QueryPayload = {
    courseId: string;
    description: string;
};

export const createWorkloadOverviewController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["courseId", "description"];

        // User has been verified
        if (isValidBody<QueryPayload>(req.body, KEYS_TO_CHECK)) {
            // Body has been verified
            const { courseId, description } = req.body;

            const workloadOverviewId = await createWorkloadOverview(
                courseId,
                description,
                authUser.uid,
            );

            logger.info(`workloadOverviewId: ${workloadOverviewId}`);
            return res.status(200).json({ workloadOverviewId });
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

export const createWorkloadOverview = async (
    courseId: string,
    description: string,
    firebase_uid: string,
): Promise<string> => {
    if (!(await checkAdmin(firebase_uid))) {
        throw new HttpException(403, "Must be an admin to create a Workload Overview for a course");
    }

    const course = await Course.findById(courseId).catch(() => null);
    if (course == null) {
        throw new HttpException(400, `Course, ${courseId}, does not exist`);
    }

    const newWorkOverview = new WorkloadOverview({
        description: description,
        weeks: [],
    });

    const workloadOverviewId = await newWorkOverview
        .save()
        .then((res) => {
            return res._id;
        })
        .catch((err) => {
            throw new HttpException(500, "Failed to create workload overview", err);
        });

    //Add task to the week
    course.workloadOverview = workloadOverviewId;

    await course.save().catch((err) => {
        throw new HttpException(500, "Failed to add workload overview to course", err);
    });

    return courseId;
};
