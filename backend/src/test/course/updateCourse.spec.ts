import Course from "@/models/course.model";
import User from "@/models/user.model";
import { registerUser } from "@/routes/auth/register.route";
import { createCourse } from "@/routes/course/createCourse.route";
import { updateCourse } from "@/routes/course/updateCourse.route";
import initialiseMongoose from "../testUtil";

describe("Test recalling a course", () => {
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
    }, 10000);

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
    }, 10000);

    afterAll(async () => {
        // Clean up
        await Course.findByIdAndDelete(courseId);
        await User.deleteOne({ firebase_uid: `acc1${id}` }).exec();
    });
});
