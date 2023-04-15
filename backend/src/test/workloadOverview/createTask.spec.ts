import Course from "@/models/course/course.model";
import Page from "@/models/course/page/page.model";
import Task from "@/models/course/workloadOverview/Task.model";
import WorkloadOverview from "@/models/course/workloadOverview/WorkloadOverview.model";
import Week from "@/models/course/workloadOverview/week.model";
import User from "@/models/user.model";
import { createCourse } from "@/routes/course/createCourse.route";
import { getCourse } from "@/routes/course/getCourse.route";
import { createPage } from "@/routes/page/createPage.route";
import { registerUser } from "@/routes/user/register.route";
import { createTask } from "@/routes/workloadOverview/createTask.route";
import { createWeek } from "@/routes/workloadOverview/createWeek.route";
import { logger } from "@/utils/logger";
import { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import initialiseMongoose from "../testUtil";

describe("Test creating a week", () => {
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

    it("Should create a new tasks within week", async () => {
        const task1Id = await createTask(
            {
                courseId: courseId,
                weekId: weekId,
                title: "Do Task 1",
                description: "Look at week 1",
            },
            `acc${id}`,
        );
        const task2Id = await createTask(
            {
                courseId: courseId,
                weekId: weekId,
                title: "Do Task 2",
                description: "Look at week 1",
            },
            `acc${id}`,
        );

        const week = await Week.findById(weekId);

        expect(week).not.toBeNull();

        expect(week?.tasks.length).toEqual(2);
        expect(week?.tasks[0].toString()).toEqual(task1Id);
        expect(week?.tasks[1].toString()).toEqual(task2Id);

        await Task.findByIdAndDelete(task1Id).exec();
        await Task.findByIdAndDelete(task2Id).exec();
    });

    afterAll(async () => {
        // Clean up
        await User.deleteOne({ firebase_uid: `acc1${id}` }).exec();
        await Course.findByIdAndDelete(courseId).exec();
        await Page.findByIdAndDelete(pageId).exec();
        await Week.findByIdAndDelete(weekId).exec();
        await disconnect();
    });
});
