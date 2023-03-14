import Course from "@/models/course.model";
import User from "@/models/user.model";
import { registerUser } from "@/routes/auth/register.route";
import { addStudents } from "@/routes/course/addStudents.route";
import { createCourse } from "@/routes/course/createCourse.route";
import { updateCourse } from "@/routes/course/updateCourse.route";
import initialiseMongoose from "../testUtil";

describe("Test adding a student", () => {
    const id = Date.now();
    let courseId: string;

    beforeAll(async () => {
        await initialiseMongoose();

        await registerUser("first_name1", "last_name1", `admin${id}@email.com`, `acc${id}`);
        await registerUser("first_name2", "last_name2", `student1${id}@email.com`, `acc1${id}`);
        await registerUser("first_name3", "last_name3", `student2${id}@email.com`, `acc2${id}`);
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

    it("Add no users to course", async () => {
        await addStudents({
            courseId: courseId,
            students: Array<string>(),
        });

        const myCourse = await Course.findById(courseId);

        expect(myCourse?.students).toEqual([]);
    }, 1000);

    it("Add students to course", async () => {
        await addStudents({
            courseId: courseId,
            students: Array<string>(`student1${id}@email.com`, `student2${id}@email.com`),
        });

        const myCourse = await Course.findById(courseId);

        console.log(myCourse);

        expect(myCourse?.students).toEqual([`student2${id}@email.com`, `student2${id}@email.com`]);
    }, 1000);

    afterAll(async () => {
        // Clean up
        await Course.findByIdAndDelete(courseId);
        await User.deleteOne({ firebase_uid: `acc${id}` }).exec();
        await User.deleteOne({ firebase_uid: `acc1${id}` }).exec();
        await User.deleteOne({ firebase_uid: `acc2${id}` }).exec();
    });
});
