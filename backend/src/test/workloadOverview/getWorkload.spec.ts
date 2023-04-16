import Course from "@/models/course/course.model";
import Page from "@/models/course/page/page.model";
import Task from "@/models/course/workloadOverview/Task.model";
import Week from "@/models/course/workloadOverview/week.model";
import User from "@/models/user.model";
import { createCourse } from "@/routes/course/createCourse.route";
import { createPage } from "@/routes/page/createPage.route";
import { registerUser } from "@/routes/user/register.route";
import { createTask } from "@/routes/workloadOverview/createTask.route";
import { createWeek } from "@/routes/workloadOverview/createWeek.route";
import { getWorkload } from "@/routes/workloadOverview/getWorkload.route";
import { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import initialiseMongoose from "../testUtil";

describe("Test getting a workload for a course", () => {
    const id = uuidv4();
    let courseId: string;
    let page1Id: string;
    let page2Id: string;
    let week1Id: string;
    let week2Id: string;
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

        page1Id = await createPage(courseId, "Test page 1", `acc${id}`);
        page2Id = await createPage(courseId, "Test page 2", `acc${id}`);

        week1Id = await createWeek(
            `${courseId}`,
            page1Id,
            "Week 1",
            "Week 1 Description",
            "2023-04-08T12:00:00+10:00",
            `acc${id}`,
        );
        task1Id = await createTask(
            {
                courseId: courseId,
                weekId: week1Id,
                title: "Do Task 1",
                description: "Look at week 1",
            },
            `acc${id}`,
        );
        task2Id = await createTask(
            {
                courseId: courseId,
                weekId: week1Id,
                title: "Do Task 2",
                description: "Look at week 1",
            },
            `acc${id}`,
        );

        week2Id = await createWeek(
            `${courseId}`,
            page2Id,
            "Week 2",
            "Week 2 Description",
            "2023-04-08T12:00:00+10:00",
            `acc${id}`,
        );
    });

    it("Should retreive an entire workload for a course", async () => {
        const workloadOverview = await getWorkload(courseId);
        expect(workloadOverview).not.toBeNull();
        expect(workloadOverview.weeks.length).toBe(2);

        expect(workloadOverview.weeks[0].tasks.length).toBe(2);
        expect(workloadOverview.weeks[1].tasks.length).toBe(0);

        expect(workloadOverview.weeks[0].title).toBe("Week 1");
        expect(workloadOverview.weeks[0].description).toBe("Week 1 Description");

        expect(workloadOverview.weeks[1].title).toBe("Week 2");
        expect(workloadOverview.weeks[1].description).toBe("Week 2 Description");
    });

    afterAll(async () => {
        await User.deleteOne({ firebase_uid: `acc1${id}` }).exec();
        await Course.findByIdAndDelete(courseId).exec();
        await Page.findByIdAndDelete(page1Id).exec();
        await Page.findByIdAndDelete(page2Id).exec();
        await Week.findByIdAndDelete(week1Id).exec();
        await Week.findByIdAndDelete(week2Id).exec();
        await Task.findByIdAndDelete(task1Id).exec();
        await Task.findByIdAndDelete(task2Id).exec();
        await disconnect();
    });
});
