import Course from "@/models/course.model";
import User from "@/models/user.model";
import { registerUser } from "@/routes/auth/register.route";
import { addStudents } from "@/routes/course/addStudents.route";
import { createCourse } from "@/routes/course/createCourse.route";
import { removeStudents } from "@/routes/course/removeStudents.route";
import initialiseMongoose from "../testUtil";

describe("Test removing a student", () => {
    const id = Date.now();
    let courseId: string;

    beforeAll(async () => {
        await initialiseMongoose();

        await registerUser("first_name1", "last_name1", `removeadmin${id}@email.com`, `acc${id}`);
        await registerUser(
            "first_name2",
            "last_name2",
            `removestudent1${id}@email.com`,
            `acc1${id}`,
        );
        await registerUser(
            "first_name3",
            "last_name3",
            `removestudent2${id}@email.com`,
            `acc2${id}`,
        );
        await registerUser(
            "first_name4",
            "last_name4",
            `removestudent3${id}@email.com`,
            `acc3${id}`,
        );
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
        await addStudents({
            courseId: courseId,
            students: Array<string>(
                "fakeRemoveStudent@email.com",
                `removestudent1${id}@email.com`,
                `removestudent2${id}@email.com`,
                `removestudent3${id}@email.com`,
            ),
        });
    });

    it("Remove no users from course", async () => {
        await removeStudents({
            courseId: courseId,
            students: Array<string>(),
        });

        const myCourse = await Course.findById(courseId);
        const student1 = await User.findOne({ email: `removestudent1${id}@email.com` });
        const student2 = await User.findOne({ email: `removestudent2${id}@email.com` });
        const student3 = await User.findOne({ email: `removestudent3${id}@email.com` });

        expect(myCourse?.students).toEqual([student1?._id, student2?._id, student3?._id]);
        expect(student1?.enrolments).toEqual([myCourse?._id]);
        expect(student2?.enrolments).toEqual([myCourse?._id]);
        expect(student3?.enrolments).toEqual([myCourse?._id]);
    }, 2000);

    it("Remove users from course", async () => {
        expect(
            await removeStudents({
                courseId: courseId,
                students: Array<string>(
                    "fakeRemoveStudent@email.com",
                    `removestudent1${id}@email.com`,
                    `removestudent2${id}@email.com`,
                    `removestudent3${id}@email.com`,
                ),
            }),
        ).toEqual(["fakeRemoveStudent@email.com"]);

        const myCourse = await Course.findById(courseId);
        const student1 = await User.findOne({ email: `removestudent1${id}@email.com` });
        const student2 = await User.findOne({ email: `removestudent2${id}@email.com` });
        const student3 = await User.findOne({ email: `removestudent3${id}@email.com` });

        expect(myCourse?.students).toEqual([]);
        expect(student1?.enrolments).toEqual([]);
        expect(student2?.enrolments).toEqual([]);
        expect(student3?.enrolments).toEqual([]);
    }, 2000);

    afterAll(async () => {
        // Clean up
        await Course.findByIdAndDelete(courseId);
        await User.deleteOne({ firebase_uid: `acc${id}` }).exec();
        await User.deleteOne({ firebase_uid: `acc1${id}` }).exec();
        await User.deleteOne({ firebase_uid: `acc2${id}` }).exec();
        await User.deleteOne({ firebase_uid: `acc3${id}` }).exec();
    });
});
