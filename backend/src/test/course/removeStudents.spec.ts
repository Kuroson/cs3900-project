import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course/course.model";
import User from "@/models/user.model";
import { addStudents } from "@/routes/course/addStudents.route";
import { createCourse } from "@/routes/course/createCourse.route";
import { removeStudents } from "@/routes/course/removeStudents.route";
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

    const admin = genUserTestOnly(
        "first_name1",
        "last_name1",
        `removeadmin${id}@email.com`,
        `acc${id}`,
    );

    const student = genUserTestOnly(
        "first_name2",
        "last_name2",
        `removestudent1${id}@email.com`,
        `acc1${id}`,
    );

    const userData = [
        admin,
        student,
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
        await addStudents(
            courseId,
            [
                "fakeRemoveStudent@email.com",
                `removestudent1${id}@email.com`,
                `removestudent2${id}@email.com`,
                `removestudent3${id}@email.com`,
            ],
            admin.firebaseUID,
        );
    });

    it("Remove no users from course", async () => {
        await removeStudents(courseId, [], admin.firebaseUID);

        const myCourse = await Course.findById(courseId)
            .populate({
                path: "students",
                model: "Enrolment",
                select: "_id student",
                populate: {
                    path: "student",
                    model: "User",
                },
            })
            .exec();
        const students = await User.find({
            email: [
                `removestudent1${id}@email.com`,
                `removestudent2${id}@email.com`,
                `removestudent3${id}@email.com`,
            ],
        }).exec();
        expect(students.length).toBe(3);

        // Parse each student id to string
        const ourOutput = myCourse?.students.map((x) => stringifyOutput(x.student._id)) ?? [];
        const expectedStudentsIds = students.map((x) => stringifyOutput(x._id));
        expect(ourOutput.length).toBe(3);
        expect(ourOutput.sort()).toEqual(expectedStudentsIds.sort());
        // expect(students.at(0)?.enrolments).toEqual([myCourse?._id]);
        // expect(students.at(1)?.enrolments).toEqual([myCourse?._id]);
        // expect(students.at(2)?.enrolments).toEqual([myCourse?._id]);
    });

    it("Remove users from course", async () => {
        expect(
            await removeStudents(
                courseId,
                [
                    "fakeRemoveStudent@email.com",
                    `removestudent1${id}@email.com`,
                    `removestudent2${id}@email.com`,
                    `removestudent3${id}@email.com`,
                ],
                admin.firebaseUID,
            ),
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

    it("Remove users from course with invalid course id", async () => {
        await expect(
            removeStudents(
                "invalidCourseId",
                [
                    `removestudent1${id}@email.com`,
                    `removestudent2${id}@email.com`,
                    `removestudent3${id}@email.com`,
                ],
                admin.firebaseUID,
            ),
        ).rejects.toThrow(HttpException);

        await removeStudents(
            "invalidCourseId",
            [
                `removestudent1${id}@email.com`,
                `removestudent2${id}@email.com`,
                `removestudent3${id}@email.com`,
            ],
            admin.firebaseUID,
        ).catch((err) => {
            expect(err.status).toBe(400);
        });
    });

    it("Student attempts to remove students from course", async () => {
        await expect(
            removeStudents(
                courseId,
                [
                    `removestudent1${id}@email.com`,
                    `removestudent2${id}@email.com`,
                    `removestudent3${id}@email.com`,
                ],
                student.firebaseUID,
            ),
        ).rejects.toThrow(HttpException);

        await removeStudents(
            courseId,
            [
                `removestudent1${id}@email.com`,
                `removestudent2${id}@email.com`,
                `removestudent3${id}@email.com`,
            ],
            student.firebaseUID,
        ).catch((err) => {
            expect(err.status).toBe(403);
        });
    });

    afterAll(async () => {
        // Clean up
        await Course.findByIdAndDelete(courseId);
        await User.deleteMany({ email: userData.map((x) => x.email) }).exec();
        await disconnect();
    });
});
