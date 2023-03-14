import Course from "@/models/course.model";
import Page from "@/models/page.model";
import Resource from "@/models/resource.model";
import Section from "@/models/section.model";
import User from "@/models/user.model";
import { registerUser } from "@/routes/auth/register.route";
import { createCourse } from "@/routes/course/createCourse.route";
import { addResource } from "@/routes/page/addResource.route";
import { addSection } from "@/routes/page/addSection.route";
import { createPage } from "@/routes/page/createPage.route";
import { deletePage } from "@/routes/page/deletePage.route";
import initialiseMongoose from "../testUtil";

describe("Test adding a resource", () => {
    const id = Date.now();
    let courseId: string;
    let pageId: string;
    let sectionId: string;

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
        pageId = await createPage(
            {
                courseId,
                title: "New section",
            },
            `acc${id}`,
        );
        sectionId = await addSection({ courseId, pageId, title: "Test section" }, `acc${id}`);
    });

    it("Adding resource to base page", async () => {
        const resourceId = await addResource(
            { courseId, pageId, title: "Test resource", description: "Test description" },
            `acc${id}`,
        );

        const myPage = await Page.findById(pageId);

        expect(myPage === null).toBe(false);
        expect(myPage?.resources.length).toBe(1);

        const myResource = await Resource.findById(resourceId);
        expect(myResource === null).toBe(false);
        expect(myResource?.title).toBe("Test resource");
        expect(myResource?.description).toBe("Test description");
    }, 10000);

    it("Adding resource to section", async () => {
        const resourceId = await addResource(
            {
                courseId,
                pageId,
                sectionId,
                title: "Another resource",
            },
            `acc${id}`,
        );

        const mySection = await Section.findById(sectionId);

        expect(mySection === null).toBe(false);
        expect(mySection?.resources.length).toBe(1);

        const myResource = await Resource.findById(resourceId);
        expect(myResource === null).toBe(false);
        expect(myResource?.title).toBe("Another resource");
        expect(myResource?.description).toBe(undefined);
    }, 10000);

    afterAll(async () => {
        // Clean up
        await deletePage({ courseId, pageId }, `acc${id}`);
        await User.deleteOne({ firebase_uid: `acc1${id}` }).exec();
        await Course.findByIdAndDelete(courseId).exec();
    });
});
