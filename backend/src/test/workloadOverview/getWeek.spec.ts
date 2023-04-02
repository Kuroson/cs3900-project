import Course from "@/models/course/course.model";
import Task from "@/models/course/workloadOverview/Task.model";
import Week from "@/models/course/workloadOverview/week.model";
import User from "@/models/user.model";
import { createCourse } from "@/routes/course/createCourse.route";
import { registerUser } from "@/routes/user/register.route";
import { createTask } from "@/routes/workloadOverview/createTask.route";
import { createWeek } from "@/routes/workloadOverview/createWeek.route";
import { getWeek } from "@/routes/workloadOverview/getWeek.route";
import { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import initialiseMongoose from "../testUtil";

describe("Test getting a week of courses", () => {
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

        weekId = await createWeek(`${courseId}`, "Week 1", "Week 1 Description", `acc${id}`);
        task1Id = await createTask(weekId, "Do Task 1", "Look at week 1", `acc${id}`);
        task2Id = await createTask(weekId, "Do Task 2", "Look at week 2", `acc${id}`);
    });

    it("Should retrieve a week's worth of tasks", async () => {
        const week = await getWeek(courseId, weekId);
        expect(week).not.toBeNull();
        expect(week.title as string).toEqual("Week 1");
        expect(week.description as string).toEqual("Week 1 Description");
        expect(week.tasks.length).toEqual(2);

        expect(week.tasks[0].title as string).toEqual("Do Task 1");
        expect(week.tasks[0].description as string).toEqual("Look at week 1");

        expect(week.tasks[1].title as string).toEqual("Do Task 2");
        expect(week.tasks[1].description as string).toEqual("Look at week 2");
    });

    afterAll(async () => {
        await User.deleteOne({ firebase_uid: `acc1${id}` }).exec();
        await Course.findByIdAndDelete(courseId).exec();
        await Week.findByIdAndDelete(weekId).exec();
        await Task.findByIdAndDelete(task1Id).exec();
        await Task.findByIdAndDelete(task2Id).exec();
        await disconnect();
    });
});