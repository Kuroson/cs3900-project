import { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import Course from "@/models/course/course.model";
import User from "@/models/user.model";
import { archiveCourse } from "@/routes/course/archiveCourse.route";
import { createCourse } from "@/routes/course/createCourse.route";
import initialiseMongoose, { genUserTestOnly, registerMultipleUsersTestingOnly } from "../testUtil";

describe("Test archiving a course", () => {
    const id = uuidv4();
    let courseId: string;

    const admin = genUserTestOnly("first_name1", "last_name1", `admin${id}@email.com`, `acc${id}`);

    const userData = [admin];

    beforeAll(async () => {
        await initialiseMongoose();
        await registerMultipleUsersTestingOnly(userData);

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

    it("Can set course archived state", async () => {
        let course = await Course.findById(courseId);
        expect(course?.archived).toBe(false);

        await archiveCourse({ courseId, archived: true }, `acc${id}`);
        course = await Course.findById(courseId);
        expect(course?.archived).toBe(true);

        await archiveCourse({ courseId, archived: false }, `acc${id}`);
        course = await Course.findById(courseId);
        expect(course?.archived).toBe(false);
    });

    afterAll(async () => {
        // Clean up
        await Course.findByIdAndDelete(courseId);
        await User.deleteMany({ email: userData.map((x) => x.email) }).exec();
        await disconnect();
    });
});
