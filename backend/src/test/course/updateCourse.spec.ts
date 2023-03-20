import Course from "@/models/course/course.model";
import User from "@/models/user.model";
import { createCourse } from "@/routes/course/createCourse.route";
import { updateCourse } from "@/routes/course/updateCourse.route";
import { registerUser } from "@/routes/user/register.route";
import { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import initialiseMongoose from "../testUtil";

describe("Test recalling a course", () => {
    const id = uuidv4();
    let courseId: string;

    beforeAll(async () => {
        await initialiseMongoose();
        await registerUser("first_name", "last_name", `admin${id}@email.com`, `acc${id}`);
    });

    beforeEach(async () => {
        courseId = await createCourse(
            {
                code: "TEST",
                title: "Test",
                session: "T1",
                description: "",
                icon: "",
            },
            `acc${id}`,
        );
    });

    it("Can update course information", async () => {
        await updateCourse(
            {
                courseId: courseId,
                code: "TEST2",
                title: "New Title",
                session: "T2",
                description: "This is updated info",
                icon: "",
            },
            `acc${id}`,
        );

        const myCourse = await Course.findById(courseId);

        expect(myCourse?.code).toBe("TEST2");
        expect(myCourse?.title).toBe("New Title");
        expect(myCourse?.session).toBe("T2");
        expect(myCourse?.description).toBe("This is updated info");
        expect(myCourse?.icon).toBe("");
    });

    it("Invalid course ID should throw", async () => {
        expect(
            updateCourse(
                {
                    courseId: "FAKE ID",
                    code: "TEST2",
                    title: "New Title",
                    session: "T2",
                    description: "This is updated info",
                    icon: "",
                },
                `acc${id}`,
            ),
        ).rejects.toThrow();
    });

    it("If only certain fields supplied, others are left unchanged", async () => {
        await updateCourse(
            {
                courseId: courseId,
                title: "New Title",
                description: "This is updated info",
            },
            `acc${id}`,
        );

        const myCourse = await Course.findById(courseId);

        expect(myCourse?.code).toBe("TEST");
        expect(myCourse?.title).toBe("New Title");
        expect(myCourse?.session).toBe("T1");
        expect(myCourse?.description).toBe("This is updated info");
        expect(myCourse?.icon).toBe("");
    });

    afterEach(async () => {
        await Course.findByIdAndDelete(courseId);
    });

    afterAll(async () => {
        // Clean up
        await User.deleteOne({ firebase_uid: `acc1${id}` }).exec();
        await disconnect();
    });
});
