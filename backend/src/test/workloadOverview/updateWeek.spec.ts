import Course from "@/models/course/course.model";
import Page from "@/models/course/page/page.model";
import Week from "@/models/course/workloadOverview/week.model";
import User from "@/models/user.model";
import { createCourse } from "@/routes/course/createCourse.route";
import { createPage } from "@/routes/page/createPage.route";
import { registerUser } from "@/routes/user/register.route";
import { createWeek } from "@/routes/workloadOverview/createWeek.route";
import { updateWeek } from "@/routes/workloadOverview/updateWeek.route";
import { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import initialiseMongoose from "../testUtil";

describe("Test updating a week", () => {
    const id = uuidv4();
    let courseId: string;
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
    });

    it("Should update parameters in week ", async () => {
        const weekId = await createWeek(
            `${courseId}`,
            pageId,
            "Week 1",
            "Week 1 Description",
            `acc${id}`,
        );
        let newWeekId = await updateWeek(
            {
                weekId: weekId,
                title: "Updated Week 1 Week Title",
            },
            `acc${id}`,
        );

        let updatedWeek = await Week.findById(weekId);
        expect(updatedWeek).not.toBeNull();
        expect(updatedWeek?.title).toBe("Updated Week 1 Week Title");

        newWeekId = await updateWeek(
            {
                weekId: weekId,
                description: "Updated Week 1 Description",
            },
            `acc${id}`,
        );

        updatedWeek = await Week.findById(weekId);
        expect(updatedWeek).not.toBeNull();

        expect(updatedWeek?.description).toBe("Updated Week 1 Description");

        await Week.findByIdAndDelete(weekId).exec();
    });

    afterAll(async () => {
        await User.deleteOne({ firebase_uid: `acc1${id}` }).exec();
        await Course.findByIdAndDelete(courseId).exec();
        await Page.findByIdAndDelete(pageId).exec();
        await disconnect();
    });
});
