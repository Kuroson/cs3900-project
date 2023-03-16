import Course from "@/models/course.model";
import User from "@/models/user.model";
import { registerUser } from "@/routes/auth/register.route";
import { createCourse } from "@/routes/course/createCourse.route";
import { getCourse } from "@/routes/course/getCourse.route";
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

    it("Can recall course information", async () => {
        const myCourse = await getCourse(courseId);

        expect(myCourse?.code).toBe("TEST");
        expect(myCourse?.title).toBe("Test");
        expect(myCourse?.session).toBe("T1");
        expect(myCourse?.description).toBe("This is a test course");
        expect(myCourse?.icon).toBe("");
    });

    it("Invalid course ID should throw", async () => {
        expect(getCourse("FAKE ID")).rejects.toThrow();
    });

    afterAll(async () => {
        // Clean up
        await Course.findByIdAndDelete(courseId);
        await User.deleteOne({ firebase_uid: `acc1${id}` }).exec();
    });
});
