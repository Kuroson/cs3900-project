import Course from "@/models/course.model";
import User from "@/models/user.model";
import { registerUser } from "@/routes/auth/register.route";
import { createCourse } from "@/routes/course/createCourse.route";
import initialiseMongoose from "../testUtil";

describe("Test creating a course", () => {
    const id = Date.now();
    let adminId = "";

    beforeAll(async () => {
        await initialiseMongoose();

        await registerUser("first_name", "last_name", `admin${id}@email.com`, `acc${id}`);
    });

    it("Should create a new course in the database", async () => {
        const courseId = await createCourse(
            {
                code: "TEST",
                title: "Test",
                session: "T1",
                description: "This is a test course",
                icon: "",
            },
            `acc${id}`,
        );

        const myCourse = await Course.findById(courseId);

        expect(myCourse?.code).toBe("TEST");
        expect(myCourse?.title).toBe("Test");
        expect(myCourse?.session).toBe("T1");
        expect(myCourse?.description).toBe("This is a test course");
        expect(myCourse?.icon).toBe("");

        // Delete the course
        await Course.findByIdAndDelete(courseId);
    }, 10000);

    it("Can successfully create two courses with the same info", async () => {}, 10000);

    afterAll(async () => {
        // Clean up
        await User.deleteOne({ firebase_uid: `acc1${id}` }).exec();
    });
});
