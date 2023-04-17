import { Request, Response } from "express";
import { HttpException } from "@/exceptions/HttpException";
import { AssignmentInterface } from "@/models/course/assignment/assignment.model";
import { CourseInterface } from "@/models/course/course.model";
import { EnrolmentInterface } from "@/models/course/enrolment/enrolment.model";
import { OnlineClassInterface } from "@/models/course/onlineClass/onlineClass.model";
import { QuizInterface } from "@/models/course/quiz/quiz.model";
import { WorkloadOverviewInterface } from "@/models/course/workloadOverview/WorkloadOverview.model";
import { WeekInterface } from "@/models/course/workloadOverview/week.model";
import User, { UserInterface } from "@/models/user.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, getUserId, isValidBody } from "@/utils/util";

type ItemType = {
    courseCode: string;
    courseTitle: string;
    type: string;
    title: string;
    deadline?: string;
    deadlineTimestamp?: number;
    start?: string;
};

type ResponsePayload = {
    deadlines: Array<ItemType>;
};

type QueryPayload = Record<string, never>;

/**
 * GET /user/schedule
 * Gets the schedule of due items for the current user
 * @param req
 * @param res
 * @returns
 */
export const getScheduleController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = [];

        // User has been verified
        if (isValidBody<QueryPayload>(req.query, KEYS_TO_CHECK)) {
            // Body has been verified

            const deadlines = await getSchedule(authUser.uid);

            return res.status(200).json({ deadlines });
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
 * Gets the schedule of the current user including all due items in all non-archived courses.
 * This includes all quizzes, assignments, classes, and workloads
 *
 * @param queryBody Arguments containing the fields defined above in QueryPayload
 * @param firebase_uid Unique identifier of user
 * @throws { HttpException } Recall failed
 * @returns Object of schedule information
 */
export const getSchedule = async (firebase_uid: string) => {
    type UserType = Omit<UserInterface, "enrolments"> & {
        enrolments: Array<
            Omit<EnrolmentInterface, "course"> & {
                course: Omit<
                    CourseInterface,
                    "onlineClasses" | "quizzes" | "assignments" | "workloadOverview"
                > & {
                    onlineClasses: Array<OnlineClassInterface>;
                    quizzes: Array<QuizInterface>;
                    assignments: Array<AssignmentInterface>;
                    workloadOverview: Omit<WorkloadOverviewInterface, "weeks"> & {
                        weeks: Array<WeekInterface>;
                    };
                };
            }
        >;
    };

    const user: UserType | null = await User.findById(await getUserId(firebase_uid)).populate({
        path: "enrolments",
        model: "Enrolment",
        populate: {
            path: "course",
            model: "Course",
            populate: [
                {
                    path: "onlineClasses",
                    model: "OnlineClass",
                },
                {
                    path: "quizzes",
                    model: "Quiz",
                },
                {
                    path: "assignments",
                    model: "Assignment",
                },
                {
                    path: "workloadOverview",
                    model: "WorkloadOverview",
                    populate: {
                        path: "weeks",
                        model: "Week",
                    },
                },
            ],
        },
    });
    if (user === null) {
        throw new HttpException(400, "Failed to recall user");
    }

    const deadlines: Array<ItemType> = [];

    // Move through each course user is enrolled in
    for (const enrolment of user.enrolments) {
        if (enrolment.course.archived) {
            continue;
        }
        // Move through quizzes, assignments, classes, and workloads
        for (const quiz of enrolment.course.quizzes) {
            deadlines.push({
                courseCode: enrolment.course.code,
                courseTitle: enrolment.course.title,
                type: "quiz",
                title: quiz.title,
                deadline: quiz.close,
                start: quiz.open,
            });
        }

        for (const assignment of enrolment.course.assignments) {
            deadlines.push({
                courseCode: enrolment.course.code,
                courseTitle: enrolment.course.title,
                type: "assignment",
                title: assignment.title,
                deadline: assignment.deadline,
            });
        }

        for (const workloadWeek of enrolment.course.workloadOverview.weeks) {
            deadlines.push({
                courseCode: enrolment.course.code,
                courseTitle: enrolment.course.title,
                type: "workload",
                title: workloadWeek.title,
                deadline: workloadWeek.deadline,
            });
        }

        for (const onlineClass of enrolment.course.onlineClasses) {
            deadlines.push({
                courseCode: enrolment.course.code,
                courseTitle: enrolment.course.title,
                type: "class",
                title: onlineClass.title,
                deadlineTimestamp: onlineClass.startTime,
            });
        }
    }

    return deadlines;
};
