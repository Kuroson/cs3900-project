import Course from "@/models/course/course.model";
import { logger } from "./logger";

/**
 * Checks for and sends any required notifications for workload overview.
 * A notification is sent to all individuals in the course when they have
 * tasks assigned that are near their due date.
 */
const checkWorkloadNotifications = async () => {
    // Add due date to weeks
    // Collect all tasks in all courses (populate all courses with workload weeks and tasks)
    // Get all completed tasks for the course (populate student enrolments)

    const courses = await Course.find()
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
                populate: {
                    path: "workloadCompletion",
                    model: "WorkloadCompletion",
                },
            },
        ])
        .catch((err) => {
            logger.error(err);
            return null;
        });
    if (courses === null) {
        logger.error("No courses in system");
    }
};
