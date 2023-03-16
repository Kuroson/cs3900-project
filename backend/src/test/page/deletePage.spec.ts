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
    });

    it("Should remove page from course and database", async () => {
        const pageId = await createPage(
            {
                title: "Test page",
                courseId,
            },
            `acc${id}`,
        );

        let myCourse = await Course.findById(courseId);
        expect(myCourse?.pages.length).toBe(1);

        await deletePage({ courseId, pageId }, `acc${id}`);

        myCourse = await Course.findById(courseId);
        expect(myCourse?.pages.length).toBe(0);

        const myPage = await Page.findById(pageId);
        expect(myPage).toBe(null);
    });

    afterAll(async () => {
        // Clean up
        await User.deleteOne({ firebase_uid: `acc1${id}` }).exec();
        await Course.findByIdAndDelete(courseId).exec();
    });
});
