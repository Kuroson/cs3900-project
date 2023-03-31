import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course/course.model";
import Task from "@/models/course/workloadOverview/Task.model";
import WorkloadOverview from "@/models/course/workloadOverview/WorkloadOverview.model";
import Week from "@/models/course/workloadOverview/week.model";
import User from "@/models/user.model";
import { createCourse } from "@/routes/course/createCourse.route";
import { registerUser } from "@/routes/user/register.route";
import { createTask } from "@/routes/workloadOverview/createTask.route";
import { createWeek } from "@/routes/workloadOverview/createWeek.route";
import { deleteTask } from "@/routes/workloadOverview/deleteTask.route";
import { deleteWeek } from "@/routes/workloadOverview/deleteWeek.route";
import { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import initialiseMongoose from "../testUtil";

describe("Test deleting a week", () => {
    const id = uuidv4();
    let courseId: string;

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
    });

    it("Should delete week if it does not contain tasks", async () => {
        const weekId = await createWeek(`${courseId}`, "Week 1", "Week 1 Description", `acc${id}`);

        const course = await Course.findById(courseId);
        expect(course).not.toBeNull();

        let workload = await WorkloadOverview.findById(course?.workloadOverview);
        expect(workload).not.toBeNull();

        expect(workload?.weeks.length).toBe(1);
        expect(workload?.weeks[0].toString()).toEqual(weekId);
        await deleteWeek(
            {
                courseId: courseId,
                weekId: weekId,
            },
            `acc${id}`,
        );

        workload = await WorkloadOverview.findById(course?.workloadOverview);
        expect(workload).not.toBeNull();

        expect(workload?.weeks.length).toBe(0);
    });

    it("Should not delete week if it contains a task", async () => {
        const weekId = await createWeek(`${courseId}`, "Week 1", "Week 1 Description", `acc${id}`);
        const taskId = await createTask(weekId, "Do Task 1", "Look at week 1", `acc${id}`);

        await expect(
            deleteWeek(
                {
                    courseId: courseId,
                    weekId: weekId,
                },
                `acc${id}`,
            ),
        ).rejects.toThrow(HttpException);

        await deleteWeek(
            {
                courseId: courseId,
                weekId: weekId,
            },
            `acc${id}`,
        ).catch((err) => {
            expect(err.status).toEqual(400);
        });

        await Task.findByIdAndDelete(taskId).exec();
        await Week.findByIdAndDelete(weekId).exec();
    });

    afterAll(async () => {
        await User.deleteOne({ firebase_uid: `acc1${id}` }).exec();
        await Course.findByIdAndDelete(courseId).exec();
        await disconnect();
    });
});
