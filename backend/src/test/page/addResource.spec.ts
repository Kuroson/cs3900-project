import Course from "@/models/course/course.model";
import Page from "@/models/course/page/page.model";
import Resource from "@/models/course/page/resource.model";
import Section from "@/models/course/page/section.model";
import User from "@/models/user.model";
import { createCourse } from "@/routes/course/createCourse.route";
import { addResource } from "@/routes/page/addResource.route";
import { addSection } from "@/routes/page/addSection.route";
import { createPage } from "@/routes/page/createPage.route";
import { deletePage } from "@/routes/page/deletePage.route";
import { deleteResource } from "@/routes/page/deleteResource.route";
import { registerUser } from "@/routes/user/register.route";
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
        pageId = await createPage(courseId, "New section", `acc${id}`);
        sectionId = await addSection(
            {
                courseId,
                pageId,
                title: "Test section",
                sectionId: null,
            },
            `acc${id}`,
        );
    });

    it("Adding resource to base page", async () => {
        const resourceId = await addResource(
            {
                courseId,
                pageId,
                title: "Test resource",
                description: "Test description",
                sectionId: null,
                resourceId: null,
            },
            `acc${id}`,
        );

        const myPage = await Page.findById(pageId);

        expect(myPage === null).toBe(false);
        expect(myPage?.resources.length).toBe(1);

        const myResource = await Resource.findById(resourceId);
        expect(myResource === null).toBe(false);
        expect(myResource?.title).toBe("Test resource");
        expect(myResource?.description).toBe("Test description");

        await deleteResource(
            {
                courseId,
                pageId,
                resourceId,
                sectionId: null,
            },
            `acc${id}`,
        );
    });

    it("Adding resource to section", async () => {
        const resourceId = await addResource(
            {
                courseId,
                pageId,
                sectionId,
                title: "Another resource",
                resourceId: null,
                description: "",
            },
            `acc${id}`,
        );

        const mySection = await Section.findById(sectionId);

        expect(mySection === null).toBe(false);
        expect(mySection?.resources.length).toBe(1);

        const myResource = await Resource.findById(resourceId);
        expect(myResource === null).toBe(false);
        expect(myResource?.title).toBe("Another resource");
        expect(myResource?.description).toBe("");

        await deleteResource({ courseId, pageId, sectionId, resourceId }, `acc${id}`);
    });

    it("Updating resource information", async () => {
        const resourceId = await addResource(
            {
                courseId,
                pageId,
                title: "Test resource",
                sectionId: null,
                resourceId: null,
                description: "",
            },
            `acc${id}`,
        );

        let myPage = await Page.findById(pageId);

        expect(myPage === null).toBe(false);
        expect(myPage?.resources.length).toBe(1);

        let myResource = await Resource.findById(resourceId);
        expect(myResource === null).toBe(false);
        expect(myResource?.title).toBe("Test resource");
        expect(myResource?.description).toBe("");

        await addResource(
            {
                courseId,
                pageId,
                resourceId,
                title: "New title",
                description: "Now has a description",
                sectionId: null,
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

        await deleteResource(
            {
                courseId,
                pageId,
                resourceId,
                sectionId: null,
            },
            `acc${id}`,
        );
    });

    afterAll(async () => {
        // Clean up
        await deletePage({ courseId, pageId }, `acc${id}`);
        await User.deleteOne({ firebase_uid: `acc1${id}` }).exec();
        await Course.findByIdAndDelete(courseId).exec();
        await disconnect();
    });
});
