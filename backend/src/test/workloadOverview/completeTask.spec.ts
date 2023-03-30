import Course from "@/models/course/course.model";
import WorkloadCompletion from "@/models/course/enrolment/workloadCompletion.model";
import Task from "@/models/course/workloadOverview/Task.model";
import Week from "@/models/course/workloadOverview/week.model";
import User from "@/models/user.model";
import { addStudents } from "@/routes/course/addStudents.route";
import { createCourse } from "@/routes/course/createCourse.route";
import { registerUser } from "@/routes/user/register.route";
import { completeTask } from "@/routes/workloadOverview/completeTask.route";
import { createTask } from "@/routes/workloadOverview/createTask.route";
import { createWeek } from "@/routes/workloadOverview/createWeek.route";
import { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import initialiseMongoose, { stringifyOutput } from "../testUtil";

describe("Test completing a task", () => {
    const id = uuidv4();
    let courseId: string;
    let weekId: string;
    let task1Id: string;
    let task2Id: string;

    beforeAll(async () => {
        await initialiseMongoose();

        await registerUser("first_name", "last_name", `admin${id}@email.com`, `acc${id}`);

        courseId = await createCourse(
            {
                code: "TEST",
                title: "Test",
                session: "T1",
                description: "This is a test course",
                icon: "",
            },
            `acc${id}`,
        );

        await registerUser("first_name", "last_name", `student1${id}@email.com`, `acc1${id}`);

        weekId = await createWeek(`${courseId}`, "Week 1", "Week 1 Description", `acc${id}`);
        task1Id = await createTask(weekId, "Do Task 1", "Look at week 1", `acc${id}`);
        task2Id = await createTask(weekId, "Do Task 2", "Look at week 1", `acc${id}`);

        await addStudents(courseId, [`student1${id}@email.com`], `acc${id}`);
    });

    it("Should complete task", async () => {
        const user = await User.findOne({ email: `student1${id}@email.com` }).exec();
        expect(user).not.toBeNull();

        let workloadCompletionId = await completeTask({
            studentId: user?._id,
            courseId: courseId,
            weekId: weekId,
            taskId: task1Id,
        });

        let workloadCompletion = await WorkloadCompletion.findById(workloadCompletionId);
        expect(workloadCompletion).not.toBeNull();

        expect(workloadCompletion?.week).toEqual(weekId);
        expect(workloadCompletion?.completedTasks.length).toBe(1);
        expect(workloadCompletion?.completedTasks[0]).toEqual(task1Id);

        workloadCompletionId = await completeTask({
            studentId: user?._id,
            courseId: courseId,
            weekId: weekId,
            taskId: task2Id,
        });

        workloadCompletion = await WorkloadCompletion.findById(workloadCompletionId);
        expect(workloadCompletion).not.toBeNull();

        expect(workloadCompletion?.week).toEqual(weekId);
        expect(workloadCompletion?.completedTasks.length).toBe(2);
        expect(workloadCompletion?.completedTasks).toContain(task1Id);
        expect(workloadCompletion?.completedTasks).toContain(task2Id);
    });

    afterAll(async () => {
        // Clean up
        await User.deleteOne({ firebase_uid: `acc${id}` }).exec();
        await User.deleteOne({ firebase_uid: `acc1${id}` }).exec();
        await Course.findByIdAndDelete(courseId).exec();
        await Week.findByIdAndDelete(weekId).exec();
        await Task.findByIdAndDelete(task1Id).exec();
        await Task.findByIdAndDelete(task2Id).exec();
        await disconnect();
    });
});
