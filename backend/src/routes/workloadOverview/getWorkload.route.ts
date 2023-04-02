import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course/course.model";
import { TaskInterface } from "@/models/course/workloadOverview/Task.model";
import WorkloadOverview, {
    WorkloadOverviewInterface,
} from "@/models/course/workloadOverview/WorkloadOverview.model";
import { WeekInterface } from "@/models/course/workloadOverview/week.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";

export type WorkloadData = Omit<WorkloadOverviewInterface, "weeks"> & {
    weeks: Array<
        Omit<WeekInterface, "tasks"> & {
            tasks: TaskInterface[];
        }
    >;
};
type ResponsePayload = WorkloadData & {
    courseId: string;
};

type QueryPayload = {
    courseId: string;
};

/**
 * GET /workload
 * @param req
 * @param res
 * @returns
 */
export const getWorkloadController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const aithUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["courseId"];

        if (isValidBody<QueryPayload>(req.query, KEYS_TO_CHECK)) {
            const { courseId } = req.query;
            const data = await getWorkload(courseId);
            return res.status(200).json({
                courseId: courseId,
                ...data,
            });
        } else {
            throw new HttpException(
                400,
                `Missing body keys: ${getMissingBodyIDs<QueryPayload>(req.query, KEYS_TO_CHECK)}`,
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
 * Gets all the information and tasks relating to a workload overview
 * @param courseId
 * @returns
 */
export const getWorkload = async (courseId: string): Promise<WorkloadData> => {
    const course = await Course.findById(courseId).catch(() => null);
    if (course === null) throw new HttpException(500, `Failed to recall course of ${courseId}`);

    // Check that the workload Overview exists.
    const workloadOverview = await WorkloadOverview.findById(course.workloadOverview)
        .populate("weeks")
        .populate({
            path: "weeks",
            populate: { path: "tasks", select: "_id title description" },
        })
        .exec()
        .catch(() => null);
    if (workloadOverview == null) {
        throw new HttpException(
            400,
            `Workload Overview, ${course.workloadOverview}, does not exist`,
        );
    }

    return workloadOverview;
};
