import { HttpException } from "@/exceptions/HttpException";
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
    workloadOverviewId: string;
    title: string;
    description: string;
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
            "workloadOverviewId",
            "title",
            "description",
        ];

        // User has been verified
        if (isValidBody<QueryPayload>(req.body, KEYS_TO_CHECK)) {
            // Body has been verified
            const { workloadOverviewId, title, description } = req.body;

            const weekId = await createWeek(workloadOverviewId, title, description, authUser.uid);

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
 * @param workloadOverviewId
 * @param title
 * @param description
 * @param firebase_uid
 * @returns
 */
export const createWeek = async (
    workloadOverviewId: string,
    title: string,
    description: string,
    firebase_uid: string,
): Promise<string> => {
    if (!(await checkAdmin(firebase_uid))) {
        throw new HttpException(403, "Must be an admin to create a week for worfload overview");
    }

    const workloadOverview = await WorkloadOverview.findById(workloadOverviewId).catch((err) => {
        throw new HttpException(400, `Workload Overview, ${workloadOverviewId}, does not exist`);
    });

    const newWeek = new Week({
        title: title,
        description: description,
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

    //Add task to the week
    workloadOverview?.weeks.push(weekId);

    await workloadOverview?.save().catch((err) => {
        throw new HttpException(500, "Failed to add week to workload overview", err);
    });

    return weekId;
};
