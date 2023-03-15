import Course from "@/models/course.model";
import Page from "@/models/page.model";
import User from "@/models/user.model";
import { registerUser } from "@/routes/auth/register.route";
import { createCourse } from "@/routes/course/createCourse.route";
import { createPage } from "@/routes/page/createPage.route";
import { deletePage } from "@/routes/page/deletePage.route";
import initialiseMongoose from "../testUtil";

describe("Test creating a page", () => {
    const id = Date.now();
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
    }, 20000);

    it("Should create a new page within the database", async () => {
        const pageId = await createPage(
            {
                title: "Test page",
                courseId,
            },
            `acc${id}`,
        );

        const myPage = await Page.findById(pageId);

        expect(myPage === null).toBe(false);
        expect(myPage?.title).toBe("Test page");

        // Delete the page
        await deletePage({ courseId, pageId }, `acc${id}`);
    }, 10000);

    it("Multiple pages should be addable to the course", async () => {
        const pageId1 = await createPage(
            {
                title: "Test page",
                courseId,
            },
            `acc${id}`,
        );

        const pageId2 = await createPage(
            {
                title: "Test page 2",
                courseId,
            },
            `acc${id}`,
        );

        const myCourse = await Course.findById(courseId);
        expect(myCourse === null).toBe(false);

        expect(myCourse?.pages.length).toBe(2);
        expect(myCourse?.pages[0] as string).toEqual(pageId1);
        expect(myCourse?.pages[1] as string).toEqual(pageId2);

        // Delete the pages
        await deletePage({ courseId, pageId: pageId1 }, `acc${id}`);
        await deletePage({ courseId, pageId: pageId2 }, `acc${id}`);
    }, 10000);

    afterAll(async () => {
        // Clean up
        await User.deleteOne({ firebase_uid: `acc1${id}` }).exec();
        await Course.findByIdAndDelete(courseId).exec();
    });
});
