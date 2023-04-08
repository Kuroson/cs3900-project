import Course, { CourseInterface } from "@/models/course/course.model";
import { EnrolmentInterface } from "@/models/course/enrolment/enrolment.model";
import { WorkloadCompletionInterface } from "@/models/course/enrolment/workloadCompletion.model";
import { TaskInterface } from "@/models/course/workloadOverview/Task.model";
import { WorkloadOverviewInterface } from "@/models/course/workloadOverview/WorkloadOverview.model";
import { WeekInterface } from "@/models/course/workloadOverview/week.model";
import { UserInterface } from "@/models/user.model";
import { RecipientsType, sendEmail } from "./email";
import { logger } from "./logger";

/**
 * Checks for and sends any required notifications for workload overview.
 * A notification is sent to all individuals in the course when they have
 * tasks assigned that are near their due date.
 */
export const checkWorkloadNotifications = async () => {
    console.log("Checking for required notifications every hour");

    type CourseType = Omit<Omit<CourseInterface, "workloadOverview">, "students"> & {
        workloadOverview: Omit<WorkloadOverviewInterface, "weeks"> & {
            weeks: Array<Omit<WeekInterface, "tasks"> & { tasks: Array<TaskInterface> }>;
        };
        students: Array<
            Omit<Omit<EnrolmentInterface, "workloadCompletion">, "student"> & {
                workloadCompletion: Array<WorkloadCompletionInterface>;
                student: UserInterface;
            }
        >;
    };

    const courses: Array<CourseType> | null = await Course.find()
        .populate([
            {
                path: "workloadOverview",
                model: "WorkloadOverview",
                populate: {
                    path: "weeks",
                    model: "Week",
                    populate: {
                        path: "tasks",
                        model: "Task",
                    },
                },
            },
            {
                path: "students",
                model: "Enrolment",
                populate: [
                    {
                        path: "workloadCompletion",
                        model: "WorkloadCompletion",
                    },
                    {
                        path: "student",
                        model: "User",
                    },
                ],
            },
        ])
        .catch((err) => {
            logger.error(err);
            return null;
        });
    if (courses === null) {
        logger.error("No courses in system");
        return;
    }

    for (const course of courses) {
        // For each course
        // Look at all the workload overview weeks
        for (const week of course.workloadOverview.weeks) {
            // For each workload week
            // Check if it is due within time frame
            const timeToDeadline =
                new Date(Date.parse(week.deadline)).getTime() - new Date().getTime();
            const minutesToDeadline = Math.round(timeToDeadline / 60000);
            console.log(new Date());

            if (minutesToDeadline <= 60 && minutesToDeadline > 0) {
                // Get students that need to be notified
                // Look at enrolments in this course
                // Check if they have completed all tasks for this week
                // If they haven't completed all tasks, add to email list
                const recipients: RecipientsType = [];

                for (const student of course.students) {
                    if (
                        // True if student has completed this week
                        !student.workloadCompletion.some((workloadCompletion) => {
                            return (
                                workloadCompletion.week === week._id &&
                                week.tasks.length > 0 &&
                                workloadCompletion.completedTasks.length === week.tasks.length
                            );
                        })
                    ) {
                        // Student has not completed the week and therefore should send email to them
                        recipients.push({
                            email: student.student.email,
                            name: `${student.student.first_name} ${student.student.last_name}`,
                        });
                    }
                }

                // Send email to students about incomplete tasks
                sendEmail(
                    recipients,
                    "You have imcomplete tasks due in the next hour",
                    `You have imcomplete tasks for ${week.title} in` +
                        `the course ${course.code} which are due within` +
                        "the next hour. Log in to view them now.",
                );
            }
        }
    }
};
