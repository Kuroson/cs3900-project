import Course from "@/models/course/course.model";
import Page from "@/models/course/page/page.model";
import WorkloadOverview from "@/models/course/workloadOverview/WorkloadOverview.model";
import Week from "@/models/course/workloadOverview/week.model";
import User from "@/models/user.model";
import { createCourse } from "@/routes/course/createCourse.route";
import { getCourse } from "@/routes/course/getCourse.route";
import { createPage } from "@/routes/page/createPage.route";
import { registerUser } from "@/routes/user/register.route";
import { createWeek } from "@/routes/workloadOverview/createWeek.route";
import { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import initialiseMongoose from "../testUtil";

describe("Test creating a week", () => {
    const id = uuidv4();
    let course1Id: string;
    let course2Id: string;
    let page1Id: string;
    let page2Id: string;
    let page3Id: string;

    beforeAll(async () => {
        await initialiseMongoose();

        await registerUser("first_name", "last_name", `admin${id}@email.com`, `acc${id}`);
        course1Id = await createCourse(
            {
                code: "TEST",
                title: "Test",
                session: "T1",
                description: "This is a test course",
                icon: "",
            },
            `acc${id}`,
        );

        course2Id = await createCourse(
            {
                code: "TEST",
                title: "Test",
                session: "T1",
                description: "This is a test course",
                icon: "",
            },
            `acc${id}`,
        );

        page1Id = await createPage(course1Id, "Test page 1", `acc${id}`);
        page2Id = await createPage(course1Id, "Test page 2", `acc${id}`);
        page3Id = await createPage(course1Id, "Test page 3", `acc${id}`);
    });

    it("Should create a new week within workload overview", async () => {
        let page = await Page.findById(page1Id);
        expect(page == null).toBe(false);
        expect(page?.workload).toBeUndefined();

        const weekId = await createWeek(
            course1Id,
            page1Id,
            "Week 1",
            "Week 1 description",
            `acc${id}`,
        );
        const week = await Week.findById(weekId);

        expect(week == null).toBe(false);
        expect(week?.title).toBe("Week 1");

        page = await Page.findById(page1Id);
        expect(page == null).toBe(false);
        expect(page?.workload.toString()).toEqual(weekId);

        await Week.findByIdAndDelete(weekId).exec();
    });

    it("Multiple weeks should be added to a workload overview", async () => {
        const week1Id = await createWeek(
            course2Id,
            page2Id,
            "Week 1",
            "Week 1 description",
            `acc${id}`,
        );
        const week2Id = await createWeek(
            course2Id,
            page3Id,
            "Week 2",
            "Week 2 description",
            `acc${id}`,
        );

        const course = await Course.findById(course2Id);
        expect(course).not.toBeNull();

        const workload = await WorkloadOverview.findById(course?.workloadOverview);
        expect(workload).not.toBeNull();

        expect(workload?.weeks.length).toEqual(2);
        expect(workload?.weeks[0].toString()).toEqual(week1Id);
        expect(workload?.weeks[1].toString()).toEqual(week2Id);

        await Week.findByIdAndDelete(week1Id).exec();
        await Week.findByIdAndDelete(week2Id).exec();
    });

    afterAll(async () => {
        // Clean up
        await User.deleteOne({ firebase_uid: `acc1${id}` }).exec();
        await Course.findByIdAndDelete(course1Id).exec();
        await Course.findByIdAndDelete(course2Id).exec();
        await Page.findByIdAndDelete(page1Id).exec();
        await Page.findByIdAndDelete(page2Id).exec();
        await Page.findByIdAndDelete(page3Id).exec();
        await disconnect();
    });
});
