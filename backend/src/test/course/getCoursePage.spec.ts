/* eslint-disable @typescript-eslint/no-explicit-any */
import Course from "@/models/course/course.model";
import User from "@/models/user.model";
import { createCourse } from "@/routes/course/createCourse.route";
import { getPage } from "@/routes/course/getCoursePage.route";
import { createPage } from "@/routes/page/createPage.route";
import { deletePage } from "@/routes/page/deletePage.route";
import { updatePage } from "@/routes/page/updatePage.route";
import { registerUser } from "@/routes/user/register.route";
import { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import initialiseMongoose from "../testUtil";

describe("Test getting a page", () => {
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
    });

    beforeEach(async () => {
        pageId = await createPage(courseId, "Test page", `acc${id}`);
    });

    it("Should retrieve page information", async () => {
        await updatePage(
            {
                courseId,
                pageId,
                resources: [{ title: "res1" }, { title: "res2" }],
                sections: [
                    {
                        title: "sec1",
                        resources: [{ title: "res3" }, { title: "res4" }],
                    },
                    {
                        title: "sec2",
                        resources: [],
                    },
                ],
            },
            `acc${id}`,
        );

        const pageState = await getPage(pageId, courseId);

        expect(pageState._id).toEqual(pageId);
        expect(pageState.title).toBe("Test page");
        expect(pageState.resources.length).toBe(2);
        expect(pageState.resources[0].title).toBe("res1");
        expect(pageState.resources[1].title).toBe("res2");
        expect(pageState.sections.length).toBe(2);
        expect(pageState.sections[0].title).toBe("sec1");
        expect(pageState.sections[0].resources.length).toBe(2);
        expect(pageState.sections[0].resources[0].title).toBe("res3");
        expect(pageState.sections[0].resources[1].title).toBe("res4");
        expect(pageState.sections[1].title).toBe("sec2");
        expect(pageState.sections[1].resources.length).toBe(0);
    });

    it("Should retrieve updated page information", async () => {
        const initialPage = (await updatePage(
            {
                courseId,
                pageId,
                resources: [{ title: "res1" }, { title: "res2" }],
                sections: [
                    {
                        title: "sec1",
                        resources: [{ title: "res3" }, { title: "res4" }],
                    },
                    {
                        title: "sec2",
                        resources: [],
                    },
                ],
            },
            `acc${id}`,
        )) as any;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // initialPage.resources.push({ title: "newOne" });
        initialPage.courseId = courseId;
        initialPage.pageId = pageId;
        initialPage.resources.push({ title: "newOne" } as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        initialPage.sections.at(1)?.resources.push({ title: "newOne2" } as any);

        await updatePage(initialPage as any, `acc${id}`);

        // const updatedPageState = await getPage(pageId, courseId);

        // expect(updatedPageState._id).toBe(courseId);
        // expect(updatedPageState.title).toBe("Test page");
        // expect(updatedPageState.resources.length).toBe(3);
        // expect(updatedPageState.resources[0].title).toBe("res1");
        // expect(updatedPageState.resources[1].title).toBe("res2");
        // expect(updatedPageState.resources[2].title).toBe("newOne");
        // expect(updatedPageState.sections.length).toBe(2);
        // expect(updatedPageState.sections[0].title).toBe("sec1");
        // expect(updatedPageState.sections[0].resources.length).toBe(2);
        // expect(updatedPageState.sections[0].resources[0].title).toBe("res3");
        // expect(updatedPageState.sections[0].resources[1].title).toBe("res4");
        // expect(updatedPageState.sections[1].title).toBe("sec2");
        // expect(updatedPageState.sections[1].resources.length).toBe(1);
        // expect(updatedPageState.sections[1].resources[0].title).toBe("newOne2");
    });

    afterEach(async () => {
        await deletePage({ courseId, pageId }, `acc${id}`);
    });

    afterAll(async () => {
        // Clean up
        await Course.findByIdAndDelete(courseId).exec();
        await User.deleteOne({ firebase_uid: `acc1${id}` }).exec();
        await disconnect();
    });
});
