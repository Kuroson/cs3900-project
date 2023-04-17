import mongoose, { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import Course from "@/models/course/course.model";
import User from "@/models/user.model";
import { createCourse } from "@/routes/course/createCourse.route";
import { createPage } from "@/routes/page/createPage.route";
import { deletePage } from "@/routes/page/deletePage.route";
import { getPages } from "@/routes/page/getPages.route";
import { registerUser } from "@/routes/user/register.route";
import initialiseMongoose from "../testUtil";

describe("Test getting course pages", () => {
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

    it("Should retrieve page after added", async () => {
        const pageId = await createPage(courseId, "Test page", `acc${id}`);

        const coursePages = await getPages(courseId);
        expect(coursePages.length).toBe(1);
        expect(coursePages[0]._id).toEqual(new mongoose.Types.ObjectId(pageId));

        // Delete the page
        await deletePage({ courseId, pageId }, `acc${id}`);
    });

    it("Page state should be accurage after multiple course updates", async () => {
        const pageId1 = await createPage(courseId, "Test page", `acc${id}`);
        const pageId2 = await createPage(courseId, "Test page 2", `acc${id}`);
        const pageId3 = await createPage(courseId, "Test page 2", `acc${id}`);

        await deletePage({ courseId, pageId: pageId2 }, `acc${id}`);

        const coursePages = await getPages(courseId);
        expect(coursePages.length).toBe(2);
        expect(coursePages[0]._id).toEqual(new mongoose.Types.ObjectId(pageId1));
        expect(coursePages[1]._id).toEqual(new mongoose.Types.ObjectId(pageId3));

        // Delete the pages
        await deletePage({ courseId, pageId: pageId1 }, `acc${id}`);
        await deletePage({ courseId, pageId: pageId3 }, `acc${id}`);
    });

    afterAll(async () => {
        // Clean up
        await User.deleteOne({ firebase_uid: `acc1${id}` }).exec();
        await Course.findByIdAndDelete(courseId).exec();
        await disconnect();
    });
});
