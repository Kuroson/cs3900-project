import Course from "@/models/course.model";
import User from "@/models/user.model";
import { registerUser } from "@/routes/auth/register.route";
import { addStudents } from "@/routes/course/addStudents.route";
import { createCourse } from "@/routes/course/createCourse.route";
import { updateCourse } from "@/routes/course/updateCourse.route";
import { logger } from "@/utils/logger";
import { v4 as uuidv4 } from "uuid";
import initialiseMongoose, { stringifyOutput } from "../testUtil";

describe("Test adding a student", () => {
    const id = uuidv4();

    let courseId: string;

    beforeAll(async () => {
        // logger.transports["scaZXinfo"].silent = true;
        await initialiseMongoose();

        await registerUser("first_name1", "last_name1", `admin${id}@email.com`, `acc${id}`);
        await registerUser("first_name2", "last_name2", `student1${id}@email.com`, `acc1${id}`);
        await registerUser("first_name3", "last_name3", `student2${id}@email.com`, `acc2${id}`);
        await registerUser("first_name4", "last_name4", `student3${id}@email.com`, `acc3${id}`);
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
    }, 20000);

    it("Add no users to course", async () => {
        await addStudents({
            courseId: courseId,
            students: Array<string>(),
        });

        const myCourse = await Course.findById(courseId);

        expect(myCourse?.students).toEqual([]);
    }, 5000);

    it("Add students to course", async () => {
        await addStudents({
            courseId: courseId,
            students: Array<string>(`student1${id}@email.com`, `student2${id}@email.com`),
        });

        const myCourse = await Course.findById(courseId);
        const student1 = await User.findOne({ email: `student1${id}@email.com` });
        const student2 = await User.findOne({ email: `student2${id}@email.com` });

        const expected = [student1?._id, student2?._id];
        expect(myCourse?.students.length).toBe(expected.length);
        expect(myCourse?.students).toStrictEqual(expected);
        expect(student1?.enrolments).toStrictEqual([myCourse?._id]);
        expect(student2?.enrolments).toStrictEqual([myCourse?._id]);
    }, 5000);

    it("Add student to course", async () => {
        expect(
            await addStudents({
                courseId: courseId,
                students: Array<string>(
                    "fakeStudent@email.com",
                    `student1${id}@email.com`,
                    `student2${id}@email.com`,
                    `student3${id}@email.com`,
                ),
            }),
        ).toEqual(["fakeStudent@email.com"]);

        const myCourse = await Course.findById(courseId);
        const student1 = await User.findOne({ email: `student1${id}@email.com` });
        const student2 = await User.findOne({ email: `student2${id}@email.com` });
        const student3 = await User.findOne({ email: `student3${id}@email.com` });

        const ourOutput = myCourse?.students.map((x) => stringifyOutput(x)) ?? []; // Parse each student id to string

        expect(ourOutput.length).toBe(3);
        expect(ourOutput).toContain(stringifyOutput(student1?._id));
        expect(ourOutput).toContain(stringifyOutput(student2?._id));
        expect(ourOutput).toContain(stringifyOutput(student3?._id));
        expect(student1?.enrolments).toEqual([myCourse?._id]);
        expect(student2?.enrolments).toEqual([myCourse?._id]);
        expect(student3?.enrolments).toEqual([myCourse?._id]);
    }, 5000);

    afterAll(async () => {
        // Clean up
        await Course.findByIdAndDelete(courseId);
        await User.deleteOne({ firebase_uid: `acc${id}` }).exec();
        await User.deleteOne({ firebase_uid: `acc1${id}` }).exec();
        await User.deleteOne({ firebase_uid: `acc2${id}` }).exec();
        await User.deleteOne({ firebase_uid: `acc3${id}` }).exec();
    });
});
