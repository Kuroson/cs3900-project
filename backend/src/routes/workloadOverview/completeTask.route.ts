import { HttpException } from "@/exceptions/HttpException";
import Enrolment, { EnrolmentInterface } from "@/models/course/enrolment/enrolment.model";
import WorkloadCompletion from "@/models/course/enrolment/workloadCompletion.model";
import Task from "@/models/course/workloadOverview/Task.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";
import { checkAdmin } from "../admin/admin.route";
import { WorkloadCompletionInterface } from "./../../models/course/enrolment/workloadCompletion.model";
import { WeekInterface } from "./../../models/course/workloadOverview/week.model";
import { getKudos } from "../course/getKudosValues.route";
import User from "@/models/user.model";

type ResponsePayload = {
    workloadCompletionId: string;
};

type QueryPayload = {
    studentId: string;
    courseId: string;
    weekId: string;
    taskId: string;
};

export const completeTaskController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = [
            "studentId",
            "courseId",
            "weekId",
            "taskId",
        ];

        // User has been verified
        if (isValidBody<QueryPayload>(req.body, KEYS_TO_CHECK)) {
            // Body has been verified
            const queryBody = req.body;

            const completionId = await completeTask(queryBody);

            return res.status(200).json({ workloadCompletionId: completionId });
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

export const completeTask = async (queryBody: QueryPayload): Promise<string> => {
    const { studentId, courseId, weekId, taskId } = queryBody;

    type QueryDataEnrolment = Omit<
        EnrolmentInterface,
        "student" | "course" | "quizAttempts" | "assignmentSubmissions" | "workloadCompletion"
    > & {
        workloadCompletion: Array<
            Omit<WorkloadCompletionInterface, "completedTasks" | "week"> & {
                week: WeekInterface;
            }
        >;
    };

    // Get enrolment
    const enrolment: QueryDataEnrolment | null = await Enrolment.findOne(
        {
            course: courseId,
            student: studentId,
        },
        "workloadCompletion",
    )
        .populate("workloadCompletion", "_id week")
        .populate({ path: "workloadCompletion", populate: "week" })
        .exec()
        .catch(() => null);

    if (enrolment === null) {
        throw new HttpException(400, "Failed to fetch enrolment");
    }

    const existingCompletion = enrolment.workloadCompletion.find(
        (element) => element.week._id.toString() === weekId,
    );

    let workloadCompletionId;

    if (existingCompletion === undefined) {
        const newWorkload = new WorkloadCompletion({
            week: weekId,
            completedTasks: [taskId],
        });

        workloadCompletionId = await newWorkload
            .save()
            .then((res) => {
                return res._id;
            })
            .catch((err) => {
                throw new HttpException(500, "Failed to add completed task", err);
            });

        enrolment.workloadCompletion.push(workloadCompletionId);

        await enrolment.save().catch((err) => {
            throw new HttpException(500, "Failed to add new workload completion to enrolment", err);
        });
    } else {
        const workload = await WorkloadCompletion.findById(existingCompletion._id).catch(
            () => null,
        );

        if (workload === null) {
            throw new HttpException(400, "Failed to fetch completed workload");
        }

        workload.completedTasks.addToSet(taskId);
        await workload.save().catch((err) => {
            throw new HttpException(
                400,
                "Failed to add completed task to workload completion",
                err,
            );
        });

        workloadCompletionId = workload._id;
    }

    const courseKudos = await getKudos(courseId);
    const myStudent = await User.findOne({_id: studentId })
        .select("_id first_name kudos")
        .exec()
        .catch(() => null);

    if (myStudent === null)
        throw new HttpException(400, `Student of ${ studentId } does not exist`);
    myStudent.kudos = myStudent.kudos + courseKudos.weeklyTaskCompletion;

    await myStudent.save().catch((err) => {
        throw new HttpException(500, "Failed to add kudos to user", err);
    });

    return workloadCompletionId;
};
