import { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import Course from "@/models/course/course.model";
import Page from "@/models/course/page/page.model";
import User from "@/models/user.model";
import { createCourse } from "@/routes/course/createCourse.route";
import { createPage } from "@/routes/page/createPage.route";
import { deletePage } from "@/routes/page/deletePage.route";
import { registerUser } from "@/routes/user/register.route";
import initialiseMongoose from "../testUtil";

describe("Test creating a page", () => {
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

    it("Should create a new page within the database", async () => {
        const pageId = await createPage(courseId, "Test page", `acc${id}`);

        const myPage = await Page.findById(pageId);

        expect(myPage === null).toBe(false);
        expect(myPage?.title).toBe("Test page");

        // Delete the page
        await deletePage({ courseId, pageId }, `acc${id}`);
    });

    it("Multiple pages should be addable to the course", async () => {
        const pageId1 = await createPage(courseId, "Test page", `acc${id}`);
        const pageId2 = await createPage(courseId, "Test page 2", `acc${id}`);

        const myCourse = await Course.findById(courseId);
        expect(myCourse).not.toBeNull();

        expect(myCourse?.pages.length).toEqual(2);
        expect(myCourse?.pages[0].toString() as string).toEqual(pageId1);
        expect(myCourse?.pages[1].toString() as string).toEqual(pageId2);

        // Delete the pages
        await deletePage({ courseId, pageId: pageId1 }, `acc${id}`);
        await deletePage({ courseId, pageId: pageId2 }, `acc${id}`);
    });

    afterAll(async () => {
        // Clean up
        await User.deleteOne({ firebase_uid: `acc1${id}` }).exec();
        await Course.findByIdAndDelete(courseId).exec();
        await disconnect();
    });
});
