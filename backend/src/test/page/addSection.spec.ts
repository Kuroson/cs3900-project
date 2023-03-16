import Course from "@/models/course.model";
import Page from "@/models/page.model";
import Section from "@/models/section.model";
import User from "@/models/user.model";
import { registerUser } from "@/routes/auth/register.route";
import { createCourse } from "@/routes/course/createCourse.route";
import { addSection } from "@/routes/page/addSection.route";
import { createPage } from "@/routes/page/createPage.route";
import { deletePage } from "@/routes/page/deletePage.route";
import { deleteSection } from "@/routes/page/deleteSection.route";
import { v4 as uuidv4 } from "uuid";
import initialiseMongoose from "../testUtil";

describe("Test adding a section to a page", () => {
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
        pageId = await createPage(
            {
                courseId,
                title: "New section",
            },
            `acc${id}`,
        );
    });

    it("Should add a section to the page", async () => {
        const sectionId = await addSection({ courseId, pageId, title: "Test section" }, `acc${id}`);

        const myPage = await Page.findById(pageId);

        expect(myPage === null).toBe(false);
        expect(myPage?.sections.length).toBe(1);
        expect(myPage?.sections[0]).toEqual(sectionId);

        const mySection = await Section.findById(sectionId);
        expect(mySection === null).toBe(false);
        expect(mySection?.title).toBe("Test section");

        await deleteSection({ courseId, pageId, sectionId }, `acc${id}`);
    });

    it("Should update information in a section", async () => {
        const sectionId = await addSection({ courseId, pageId, title: "Test section" }, `acc${id}`);

        await addSection({ courseId, pageId, sectionId, title: "New title" }, `acc${id}`);

        const myPage = await Page.findById(pageId);

        expect(myPage === null).toBe(false);
        expect(myPage?.sections.length).toBe(1);
        expect(myPage?.sections[0]).toEqual(sectionId);

        const mySection = await Section.findById(sectionId);
        expect(mySection === null).toBe(false);
        expect(mySection?.title).toBe("New title");

        await deleteSection({ courseId, pageId, sectionId }, `acc${id}`);
    });

    afterAll(async () => {
        // Clean up
        await deletePage({ courseId, pageId }, `acc${id}`);
        await User.deleteOne({ firebase_uid: `acc1${id}` }).exec();
        await Course.findByIdAndDelete(courseId).exec();
    });
});
