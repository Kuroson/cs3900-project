import Course from "@/models/course.model";
import User from "@/models/user.model";
import { registerUser } from "@/routes/auth/register.route";
import { addStudents } from "@/routes/course/addStudents.route";
import { createCourse } from "@/routes/course/createCourse.route";
import { updateCourse } from "@/routes/course/updateCourse.route";
import { logger } from "@/utils/logger";
import { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import initialiseMongoose, {
    genUserTestOnly,
    registerMultipleUsersTestingOnly,
    stringifyOutput,
} from "../testUtil";

describe("Test adding a student", () => {
    const id = uuidv4();
    let courseId: string;

    const userData = [
        genUserTestOnly("first_name1", "last_name1", `admin${id}@email.com`, `acc${id}`),
        genUserTestOnly("first_name2", "last_name2", `student1${id}@email.com`, `acc1${id}`),
        genUserTestOnly("first_name3", "last_name3", `student2${id}@email.com`, `acc2${id}`),
        genUserTestOnly("first_name4", "last_name4", `student3${id}@email.com`, `acc3${id}`),
    ];

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

    it("Add no users to course", async () => {
        await addStudents({
            courseId: courseId,
            students: Array<string>(),
        });

        const myCourse = await Course.findById(courseId);

        expect(myCourse?.students).toEqual([]);
    });

    it("Add students to course", async () => {
        await addStudents({
            courseId: courseId,
            students: Array<string>(`student1${id}@email.com`, `student2${id}@email.com`),
        });

        const myCourse = await Course.findById(courseId);
        const students = await User.find({
            email: [`student1${id}@email.com`, `student2${id}@email.com`],
        });
        expect(students.length).toEqual(2);

        const student1 = students.at(0);
        const student2 = students.at(1);

        const ourOutput = myCourse?.students.map((x) => stringifyOutput(x)) ?? []; // Parse each student id to string
        expect(ourOutput.length).toBe(2);
        expect(ourOutput).toContain(stringifyOutput(student1?._id));
        expect(ourOutput).toContain(stringifyOutput(student2?._id));
        expect(student1?.enrolments).toStrictEqual([myCourse?._id]);
        expect(student2?.enrolments).toStrictEqual([myCourse?._id]);
    });

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
        const students = await User.find({
            email: [
                `student1${id}@email.com`,
                `student2${id}@email.com`,
                `student3${id}@email.com`,
            ],
        });

        expect(students.length).toEqual(3);

        // const student1 = students.at(0);
        // const student2 = students.at(1);
        // const student3 = students.at(2);

        const expectedStudentsIds = students.map((x) => stringifyOutput(x._id));

        const ourOutput = myCourse?.students.map((x) => stringifyOutput(x)) ?? []; // Parse each student id to string

        expect(ourOutput.length).toBe(3);
        expect(ourOutput.sort()).toEqual(expectedStudentsIds.sort());
        expect(students.at(0)?.enrolments).toEqual([myCourse?._id]);
        expect(students.at(1)?.enrolments).toEqual([myCourse?._id]);
        expect(students.at(2)?.enrolments).toEqual([myCourse?._id]);
    });

    afterAll(async () => {
        // Clean up
        await Course.findByIdAndDelete(courseId);
        await User.deleteMany({ email: userData.map((x) => x.email) }).exec();
        await disconnect();
    });
});
