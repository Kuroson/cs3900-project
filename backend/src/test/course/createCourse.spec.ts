import Course from "@/models/course/course.model";
import User from "@/models/user.model";
import { createCourse } from "@/routes/course/createCourse.route";
import { registerUser } from "@/routes/user/register.route";
import { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import initialiseMongoose from "../testUtil";

describe("Test creating a course", () => {
    const id = uuidv4();

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
    });

    it("Can successfully create two courses with the same info", async () => {
        const courseInfo = {
            code: "TEST",
            title: "Test",
            session: "T1",
            description: "This is a test course",
            icon: "",
        };

        const courseId = await createCourse(courseInfo, `acc${id}`);
        const courseId2 = await createCourse(courseInfo, `acc${id}`);

        const myCourse = await Course.findById(courseId);
        const myCourse2 = await Course.findById(courseId2);

        expect(myCourse?.code).toBe("TEST");
        expect(myCourse?.title).toBe("Test");
        expect(myCourse?.session).toBe("T1");
        expect(myCourse?.description).toBe("This is a test course");
        expect(myCourse?.icon).toBe("");

        expect(myCourse2?.code).toBe("TEST");
        expect(myCourse2?.title).toBe("Test");
        expect(myCourse2?.session).toBe("T1");
        expect(myCourse2?.description).toBe("This is a test course");
        expect(myCourse2?.icon).toBe("");

        // Delete the courses
        await Course.deleteMany({ _id: [courseId, courseId2] });
    });

    afterAll(async () => {
        // Clean up
        await User.deleteOne({ firebase_uid: `acc1${id}` }).exec();
        await disconnect();
    });
});
