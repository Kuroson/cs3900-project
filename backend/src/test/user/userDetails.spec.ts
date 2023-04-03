import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course/course.model";
import User from "@/models/user.model";
import { createCourse } from "@/routes/course/createCourse.route";
import { getUserDetails } from "@/routes/user/userDetails.route";
import { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import initialiseMongoose, { genUserTestOnly, registerMultipleUsersTestingOnly } from "../testUtil";

describe("Test user details", () => {
    const id = uuidv4();

    const student1 = genUserTestOnly(
        "first_name2",
        "last_name2",
        `student1${id}@email.com`,
        `acc1${id}`,
    );
    const student2 = genUserTestOnly(
        "first_name3",
        "last_name3",
        `student2${id}@email.com`,
        `acc2${id}`,
    );
    const admin = genUserTestOnly("first_name1", "last_name1", `admin${id}@email.com`, `acc${id}`);
    const userData = [admin, student1, student2];

    beforeAll(async () => {
        await initialiseMongoose();
        await registerMultipleUsersTestingOnly(userData);
        // For some reason we have to load the specific models here...
        Course;
        User;
    });

    it("Request bad email", async () => {
        await expect(getUserDetails("badEmail", "badEmail123")).rejects.toThrow(HttpException);
        await getUserDetails("badEmail", "badEmail123").catch((err) => {
            expect(err.status).toBe(400); // Bad request
        });
    });

    it("Student requesting their own details", async () => {
        const userDetails = await getUserDetails(student1.email, student1.email);
        expect(userDetails?.first_name).toEqual(student1.firstName);
        expect(userDetails?.last_name).toEqual(student1.lastName);
        expect(userDetails?.email).toEqual(student1.email);
        expect(userDetails?.firebase_uid).toEqual(student1.firebaseUID);
        expect(userDetails?.role).toEqual(1); // Non admin
        expect(userDetails?.enrolments).toBeInstanceOf(Array);
    });

    it("Admin requesting their own details", async () => {
        const userDetails = await getUserDetails(admin.email, admin.email);
        expect(userDetails?.first_name).toEqual(admin.firstName);
        expect(userDetails?.last_name).toEqual(admin.lastName);
        expect(userDetails?.email).toEqual(admin.email);
        expect(userDetails?.firebase_uid).toEqual(admin.firebaseUID);
        expect(userDetails?.role).toEqual(0); // Admin
        expect(userDetails?.enrolments).toBeInstanceOf(Array);
    });

    it("Admin requesting students details", async () => {
        const userDetails = await getUserDetails(student1.email, admin.email);
        expect(userDetails?.first_name).toEqual(student1.firstName);
        expect(userDetails?.last_name).toEqual(student1.lastName);
        expect(userDetails?.email).toEqual(student1.email);
        expect(userDetails?.firebase_uid).toEqual(student1.firebaseUID);
        expect(userDetails?.role).toEqual(1); // Non admin
        expect(userDetails?.enrolments).toBeInstanceOf(Array);
    });

    it("Student attempting to request another students details", async () => {
        await expect(getUserDetails(student1.email, student2.email)).rejects.toThrow(HttpException);
        await getUserDetails(student1.email, student2.email).catch((err) => {
            expect(err.status).toBe(403); // Forbidden
        });
    });

    it("Student attempting to request admin details", async () => {
        await expect(getUserDetails(admin.email, student1.email)).rejects.toThrow(HttpException);
        await getUserDetails(admin.email, student1.email).catch((err) => {
            expect(err.status).toBe(403); // Forbidden
        });
    });

    afterAll(async () => {
        // Clean up
        await User.deleteMany({ email: userData.map((x) => x.email) }).exec();
        await disconnect();
    });
});

describe("Check if created courses are turned as a part of user details", () => {
    const id = uuidv4();
    let courseId: string;

    const admin = genUserTestOnly("first_name", "last_name", `admin${id}@email.com`, `acc${id}`);
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

    it("Admin created course should be in created_courses", async () => {
        const userDetails = await getUserDetails(admin.email, admin.email);
        expect(userDetails.created_courses.length).toEqual(1);
        expect(userDetails.created_courses.at(0)?._id.toString()).toEqual(courseId);
        expect(userDetails.created_courses.at(0)?.code).toBe("TEST");
        expect(userDetails.created_courses.at(0)?.title).toBe("Test");
        expect(userDetails.created_courses.at(0)?.session).toBe("T1");
        expect(userDetails.created_courses.at(0)?.description).toBe("This is a test course");
        expect(userDetails.created_courses.at(0)?.icon).toBe("");
    });

    // TODO student enrolment

    afterAll(async () => {
        // Clean up
        await Course.findByIdAndDelete(courseId);
        await User.deleteMany({ firebase_uid: userData.map((x) => x.firebaseUID) }).exec();
        await disconnect();
    });
});
