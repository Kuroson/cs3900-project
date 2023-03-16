import Course from "@/models/course.model";
import User from "@/models/user.model";
import { registerUser } from "@/routes/auth/register.route";
import { addStudents } from "@/routes/course/addStudents.route";
import { createCourse } from "@/routes/course/createCourse.route";
import { removeStudents } from "@/routes/course/removeStudents.route";
import { updateCourse } from "@/routes/course/updateCourse.route";
import { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import initialiseMongoose, {
    genUserTestOnly,
    registerMultipleUsersTestingOnly,
    stringifyOutput,
} from "../testUtil";

describe("Test removing a student", () => {
    const id = uuidv4();
    let courseId: string;

    const userData = [
        genUserTestOnly("first_name1", "last_name1", `removeadmin${id}@email.com`, `acc${id}`),
        genUserTestOnly("first_name2", "last_name2", `removestudent1${id}@email.com`, `acc1${id}`),
        genUserTestOnly("first_name3", "last_name3", `removestudent2${id}@email.com`, `acc2${id}`),
        genUserTestOnly("first_name4", "last_name4", `removestudent3${id}@email.com`, `acc3${id}`),
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
        const students = await User.find({
            email: [
                `removestudent1${id}@email.com`,
                `removestudent2${id}@email.com`,
                `removestudent3${id}@email.com`,
            ],
        }).exec();
        expect(students.length).toBe(3);

        const ourOutput = myCourse?.students.map((x) => stringifyOutput(x)) ?? []; // Parse each student id to string
        const expectedStudentsIds = students.map((x) => stringifyOutput(x._id));
        expect(ourOutput.length).toBe(3);
        expect(ourOutput.sort()).toEqual(expectedStudentsIds.sort());
        expect(students.at(0)?.enrolments).toEqual([myCourse?._id]);
        expect(students.at(1)?.enrolments).toEqual([myCourse?._id]);
        expect(students.at(2)?.enrolments).toEqual([myCourse?._id]);
    });

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
        const students = await User.find({
            email: [
                `removestudent1${id}@email.com`,
                `removestudent2${id}@email.com`,
                `removestudent3${id}@email.com`,
            ],
        }).exec();
        expect(students.length).toBe(3);

        expect(myCourse?.students).toEqual([]);
        expect(students.every((x) => x.enrolments.length === 0)).toBe(true);
    });

    afterAll(async () => {
        // Clean up
        await Course.findByIdAndDelete(courseId);
        await User.deleteMany({ email: userData.map((x) => x.email) }).exec();
        await disconnect();
    });
});
