import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course/course.model";
import Enrolment from "@/models/course/enrolment/enrolment.model";
import User from "@/models/user.model";
import { addStudents } from "@/routes/course/addStudents.route";
import { createCourse } from "@/routes/course/createCourse.route";
import { getStudentsKudos } from "@/routes/course/getStudentsKudos.route";
import { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import initialiseMongoose, { genUserTestOnly, registerMultipleUsersTestingOnly } from "../testUtil";

describe("Test getting a list of Students and Kudos ranked based on kudos", () => {
    const id = uuidv4();
    let courseId: string;
    let studentId1: string;
    let studentId2: string;
    let studentId3: string;

    const admin = genUserTestOnly("admin_name", "admin_name", `admin${id}@email.com`, `acc${id}`);

    const userData = [
        admin,
        genUserTestOnly("first_name1", "last_name1", `student1${id}@email.com`, `acc1${id}`),
        genUserTestOnly("first_name2", "last_name2", `student2${id}@email.com`, `acc2${id}`),
        genUserTestOnly("first_name3", "last_name3", `student3${id}@email.com`, `acc3${id}`),
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
            [`student1${id}@email.com`, `student2${id}@email.com`, `student3${id}@email.com`],
            admin.firebaseUID,
        );

        // Get students
        await User.findOne({ email: `student1${id}@email.com` })
            .then((student) => {
                studentId1 = student?._id;
            })
            .catch(() => null);

        await User.findOne({ email: `student2${id}@email.com` })
            .then((student) => {
                studentId2 = student?._id;
            })
            .catch(() => null);

        await User.findOne({ email: `student3${id}@email.com` })
            .then((student) => {
                studentId3 = student?._id;
            })
            .catch(() => null);
    });

    it("Should return an array of students ranked in order", async () => {
        const enrolment1 = await Enrolment.findOne({
            student: studentId1,
        });
        const enrolment2 = await Enrolment.findOne({
            student: studentId2,
        });
        const enrolment3 = await Enrolment.findOne({
            student: studentId3,
        });

        if (enrolment3 && enrolment1) {
            enrolment3.kudosEarned = 20;
            await enrolment3.save().catch((err) => {
                throw new HttpException(500, "Failed to update enrolment", err);
            });

            enrolment1.kudosEarned = 10;
            await enrolment1.save().catch((err) => {
                throw new HttpException(500, "Failed to update enrolment", err);
            });
        }

        const res = await getStudentsKudos(courseId);

        const expectedRanking = [
            userData[3].firstName,
            userData[1].firstName,
            userData[2].firstName,
        ];

        const testRanking = res.map((elem) => {
            return elem.student.first_name;
        });

        expect(testRanking).toEqual(expectedRanking);
    });

    afterAll(async () => {
        // Clean up
        await Course.findByIdAndDelete(courseId);
        await User.deleteMany({ email: userData.map((x) => x.email) }).exec();
        await disconnect();
    });
});
