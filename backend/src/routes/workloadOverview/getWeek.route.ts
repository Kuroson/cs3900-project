import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course/course.model";
import Enrolment, { EnrolmentInterface } from "@/models/course/enrolment/enrolment.model";
import WorkloadCompletion, {
    WorkloadCompletionInterface,
} from "@/models/course/enrolment/workloadCompletion.model";
import { TaskInterface } from "@/models/course/workloadOverview/Task.model";
import WorkloadOverview from "@/models/course/workloadOverview/WorkloadOverview.model";
import Week, { WeekInterface } from "@/models/course/workloadOverview/week.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";

type ResponsePayload = {
    title: string;
    description?: string;
    deadline: string;
    uncompletedTasks: TaskInterface[];
    completedTasks: TaskInterface[];
};

type QueryPayload = {
    courseId: string;
    weekId: string;
    studentId: string;
};

/**
 * GET /workload/week
 * @param req
 * @param res
 * @returns
 */
export const getWeekController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["courseId", "weekId", "studentId"];

        if (isValidBody<QueryPayload>(req.query, KEYS_TO_CHECK)) {
            const { courseId, weekId, studentId } = req.query;
            const ret_data = await getWeek(courseId, weekId, studentId);

            return res.status(200).json(ret_data);
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
 * Gets all the information and tasks relating to a week
 * @param courseId
 * @param weekId
 * @returns
 */
export const getWeek = async (courseId: string, weekId: string, studentId: string) => {
    // Check course exists
    const course = await Course.findById(courseId).catch(() => null);
    if (course == null) {
        throw new HttpException(400, `Course, ${courseId}, does not exist`);
    }

    // Check that the workload Overview exists.
    const workloadOverview = await WorkloadOverview.findById(course.workloadOverview).catch(
        () => null,
    );
    if (workloadOverview == null) {
        throw new HttpException(
            400,
            `Workload Overview, ${course.workloadOverview}, does not exist`,
        );
    }

    // check week exists in course
    if (!workloadOverview.weeks.includes(weekId)) {
        throw new HttpException(400, `Week, ${weekId}, does not exist in course workload overview`);
    }

    // Get all week including tasks (uncompleted weeks)
    const week = await Week.findById(weekId)
        .populate("tasks")
        .populate({
            path: "tasks",
            populate: [
                { path: "quiz", select: "_id title description" },
                { path: "assignment", select: "_id title description" },
                { path: "onlineClass", select: "_id title description" },
            ],
        })
        .exec()
        .catch(() => null);
    if (week === null) throw new HttpException(400, "Week does not exist");

    const completedWeek = await WorkloadCompletion.findOne({
        week: weekId,
        student: studentId,
    })
        .populate("completedTasks")
        .populate({
            path: "completedTasks",
            populate: [
                { path: "quiz", select: "_id title description" },
                { path: "assignment", select: "_id title description" },
                { path: "onlineClass", select: "_id title description" },
            ],
        })
        .exec()
        .catch((err) => {
            throw new HttpException(400, "Could not fetch completed week", err);
        });

    // Create the response Payload
    const ret_data: ResponsePayload = {
        title: week.title,
        description: week.description === undefined ? undefined : week.description,
        deadline: week.deadline,
        uncompletedTasks:
            completedWeek !== null
                ? await getUncompleteTasks(completedWeek.completedTasks, week.tasks)
                : week.tasks,
        completedTasks: completedWeek !== null ? completedWeek.completedTasks : [],
    };

    return ret_data;
};

const getUncompleteTasks = async (
    completedTasks: TaskInterface[],
    weekTasks: TaskInterface[],
): Promise<TaskInterface[]> => {
    // Filter out all the completed tasks from the weekly tasks
    return weekTasks.filter(
        (x) =>
            completedTasks.find((y) => {
                return y._id.toString() === x._id.toString();
            }) === undefined,
    );
};
