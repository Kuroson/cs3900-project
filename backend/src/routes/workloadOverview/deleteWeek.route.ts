import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course/course.model";
import WorkloadOverview from "@/models/course/workloadOverview/WorkloadOverview.model";
import Week from "@/models/course/workloadOverview/week.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";
import { checkAdmin } from "../admin/admin.route";

type ResponsePayload = Record<string, never>;

type QueryPayload = {
    courseId: string;
    weekId: string;
};

/**
 * DELETE /workload/week/delete
 * @param req
 * @param res
 * @returns
 */
export const deleteWeekController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["courseId", "weekId"];

        // User has been verified
        if (isValidBody<QueryPayload>(req.body, KEYS_TO_CHECK)) {
            // Body has been verified
            const queryBody = req.body;

            await deleteWeek(queryBody, authUser.uid);

            return res.status(200).json({});
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
 * Deletes a week from the database, given that it is empty
 * @param queryBody
 * @param firebase_uid
 */
export const deleteWeek = async (queryBody: QueryPayload, firebase_uid: string) => {
    if (!(await checkAdmin(firebase_uid))) {
        throw new HttpException(401, "Must be an admin to delete week");
    }

    const { courseId, weekId } = queryBody;

    // Get course
    const course = await Course.findById(weekId)
        .exec()
        .catch((err) => {
            logger.error(err);
            throw new HttpException(500, "Failed to fetch course");
        });

    if (course === null) {
        throw new HttpException(500, "Failed to fetch course");
    }

    // Get workflowOverivew
    const workloadOverview = await WorkloadOverview.findById(course.workloadOverview)
        .exec()
        .catch((err) => {
            logger.error(err);
            throw new HttpException(500, "Failed to fetch workload overview for course");
        });

    if (workloadOverview === null) {
        throw new HttpException(500, "Failed to fetch workloadOverview");
    }

    // Get Week
    const week = await Week.findById(weekId)
        .exec()
        .catch((err) => {
            logger.error(err);
            throw new HttpException(500, "Failed to fetch week");
        });

    if (week === null) {
        throw new HttpException(500, "Failed to fetch week");
    }

    // Check that the week exists in the workload overview
    if (!workloadOverview.weeks.includes(weekId)) {
        throw new HttpException(
            400,
            "Failed to delete Week. Week not within provided workload Overview for course",
        );
    }

    // Check that the week does not contain tasks
    if (week.tasks.length !== 0) {
        throw new HttpException(
            400,
            "Cannot delete Week. Week contains tasks. Delete Tasks first.",
        );
    }

    // Delete Week
    await Week.findByIdAndDelete(weekId).catch((err) => {
        logger.error(err);
        throw new HttpException(500, "Failed to delete Week");
    });

    // Remove weekId from the workload overview
    workloadOverview.weeks.pull(weekId);

    // Save the updated workload overview
    await workloadOverview.save().catch((err) => {
        logger.error(err);
        throw new HttpException(500, "Failed to save updated workload overview");
    });
};
