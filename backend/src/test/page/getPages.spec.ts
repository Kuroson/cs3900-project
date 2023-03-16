import Course from "@/models/course.model";
import User from "@/models/user.model";
import { registerUser } from "@/routes/auth/register.route";
import { createCourse } from "@/routes/course/createCourse.route";
import { createPage } from "@/routes/page/createPage.route";
import { deletePage } from "@/routes/page/deletePage.route";
import { getPages } from "@/routes/page/getPages.route";
import initialiseMongoose from "../testUtil";

describe("Test geting course pages", () => {
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
    });

    it("Should retrieve page after added", async () => {
        const pageId = await createPage(
            {
                title: "Test page",
                courseId,
            },
            `acc${id}`,
        );

        const coursePages = await getPages(courseId);
        expect(coursePages.length).toBe(1);
        expect(coursePages[0].pageId).toEqual(pageId);

        // Delete the page
        await deletePage({ courseId, pageId }, `acc${id}`);
    });

    it("Page state should be accurage after multiple course updates", async () => {
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

        const pageId3 = await createPage(
            {
                title: "Test page 2",
                courseId,
            },
            `acc${id}`,
        );

        await deletePage({ courseId, pageId: pageId2 }, `acc${id}`);

        const coursePages = await getPages(courseId);
        expect(coursePages.length).toBe(2);
        expect(coursePages[0].pageId).toEqual(pageId1);
        expect(coursePages[1].pageId).toEqual(pageId3);

        // Delete the pages
        await deletePage({ courseId, pageId: pageId1 }, `acc${id}`);
        await deletePage({ courseId, pageId: pageId3 }, `acc${id}`);
    });

    afterAll(async () => {
        // Clean up
        await User.deleteOne({ firebase_uid: `acc1${id}` }).exec();
        await Course.findByIdAndDelete(courseId).exec();
    });
});
