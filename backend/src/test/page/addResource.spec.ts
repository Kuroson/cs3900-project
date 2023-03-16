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
import { deleteResource } from "@/routes/page/deleteResource.route";
import { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import initialiseMongoose from "../testUtil";

describe("Test adding a resource", () => {
    const id = uuidv4();
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

        await deleteResource({ courseId, pageId, resourceId }, `acc${id}`);
    });

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

        await deleteResource({ courseId, pageId, sectionId, resourceId }, `acc${id}`);
    });

    it("Updating resource information", async () => {
        const resourceId = await addResource(
            { courseId, pageId, title: "Test resource" },
            `acc${id}`,
        );

        let myPage = await Page.findById(pageId);

        expect(myPage === null).toBe(false);
        expect(myPage?.resources.length).toBe(1);

        let myResource = await Resource.findById(resourceId);
        expect(myResource === null).toBe(false);
        expect(myResource?.title).toBe("Test resource");
        expect(myResource?.description).toBe(undefined);

        await addResource(
            {
                courseId,
                pageId,
                resourceId,
                title: "New title",
                description: "Now has a description",
            },
            `acc${id}`,
        );

        myPage = await Page.findById(pageId);

        expect(myPage === null).toBe(false);
        expect(myPage?.resources.length).toBe(1);

        myResource = await Resource.findById(resourceId);
        expect(myResource === null).toBe(false);
        expect(myResource?.title).toBe("New title");
        expect(myResource?.description).toBe("Now has a description");

        await deleteResource({ courseId, pageId, resourceId }, `acc${id}`);
    });

    afterAll(async () => {
        // Clean up
        await deletePage({ courseId, pageId }, `acc${id}`);
        await User.deleteOne({ firebase_uid: `acc1${id}` }).exec();
        await Course.findByIdAndDelete(courseId).exec();
        await disconnect();
    });
});
