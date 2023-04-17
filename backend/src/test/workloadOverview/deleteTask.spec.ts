import { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import Course from "@/models/course/course.model";
import Page from "@/models/course/page/page.model";
import Week from "@/models/course/workloadOverview/week.model";
import User from "@/models/user.model";
import { createCourse } from "@/routes/course/createCourse.route";
import { createPage } from "@/routes/page/createPage.route";
import { registerUser } from "@/routes/user/register.route";
import { createTask } from "@/routes/workloadOverview/createTask.route";
import { createWeek } from "@/routes/workloadOverview/createWeek.route";
import { deleteTask } from "@/routes/workloadOverview/deleteTask.route";
import initialiseMongoose from "../testUtil";

describe("Test deleting a task", () => {
    const id = uuidv4();
    let courseId: string;
    let weekId: string;
    let pageId: string;

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
        pageId = await createPage(courseId, "Test page 1", `acc${id}`);

        weekId = await createWeek(
            `${courseId}`,
            pageId,
            "Week 1",
            "Week 1 Description",
            "2023-04-08T12:00:00+10:00",
            `acc${id}`,
        );
    });

    it("Should delete task from week", async () => {
        const taskId = await createTask(
            {
                courseId: courseId,
                weekId: weekId,
                title: "Do Task 1",
                description: "Look at week 1",
            },
            `acc${id}`,
        );

        let week = await Week.findById(weekId);
        expect(week).not.toBeNull();

        expect(week?.tasks.length).toEqual(1);
        expect(week?.tasks[0].toString()).toEqual(taskId);

        await deleteTask(
            {
                weekId: weekId,
                taskId: taskId,
            },
            `acc${id}`,
        );

        week = await Week.findById(weekId);
        expect(week).not.toBeNull();

        expect(week?.tasks.length).toEqual(0);
    });

    afterAll(async () => {
        await User.deleteOne({ firebase_uid: `acc1${id}` }).exec();
        await Course.findByIdAndDelete(courseId).exec();
        await Week.findByIdAndDelete(weekId).exec();
        await Page.findByIdAndDelete(pageId).exec();
        await disconnect();
    });
});
