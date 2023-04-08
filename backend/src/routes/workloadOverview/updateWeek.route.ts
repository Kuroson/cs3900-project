import { HttpException } from "@/exceptions/HttpException";
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
    weekId: string;
    title?: string;
    description?: string;
    deadline?: string;
};

/**
 * PUT /workload/week/update
 * @param req
 * @param res
 * @returns
 */
export const updateWeekController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["weekId"];

        // User has been verified
        if (isValidBody<QueryPayload>(req.body, KEYS_TO_CHECK)) {
            // Body has been verified
            const queryBody = req.body;

            const weekId = await updateWeek(queryBody, authUser.uid);

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
 * Updates an existing week with the parameters given
 * @param queryBody
 * @param firebase_uid
 * @returns
 */
export const updateWeek = async (queryBody: QueryPayload, firebase_uid: string) => {
    if (!(await checkAdmin(firebase_uid))) {
        throw new HttpException(401, "Must be an admin to update tasks");
    }

    const { weekId, title, description, deadline } = queryBody;

    const week = await Week.findById(weekId)
        .exec()
        .catch(() => null);

    if (week === null) {
        throw new HttpException(400, "Failed to fetch week");
    }

    if (title !== undefined) {
        week.title = title;
    }
    if (description !== undefined) {
        week.description = description;
    }
    if (deadline !== undefined) {
        week.deadline = deadline;
    }

    const myWeek = await week.save().catch((err) => {
        logger.error(err);
        throw new HttpException(500, "Failed to save updated week", err);
    });

    return myWeek._id;
};
