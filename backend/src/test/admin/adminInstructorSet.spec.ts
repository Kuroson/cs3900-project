import Course from "@/models/course/course.model";
import User, { INSTRUCTOR_ROLE, STUDENT_ROLE } from "@/models/user.model";
import { updateUserInstructor } from "@/routes/admin/adminInstructorSet.route";
import { registerUser } from "@/routes/user/register.route";
import { getUserDetails } from "@/routes/user/userDetails.route";
import { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import initialiseMongoose from "../testUtil";

describe("Promoting user to instructor", () => {
    const id = uuidv4();

    const adminEmail = `admin-${id}@delete.com`;
    const adminUId = `admin-${id}`;
    const userEmail = `jest-${id}@delete.com`;
    const userUId = `normal-${id}`;

    beforeAll(async () => {
        await initialiseMongoose();

        await registerUser(`firstJest${id}`, `lastJest${id}`, adminEmail, adminUId);
        await registerUser(`firstJest${id}`, `lastJest${id}`, userEmail, userUId);
    });

    it("Should promote user to instructor", async () => {
        Course;
        const userDetailsBefore = await getUserDetails(userEmail, userEmail);
        expect(userDetailsBefore.role).toEqual(STUDENT_ROLE);
        // set instructor
        await updateUserInstructor(userEmail, true);
        const userDetailsAfter = await getUserDetails(userEmail, userEmail);
        expect(userDetailsAfter.role).toEqual(INSTRUCTOR_ROLE);
    });

    it("Should demote user to student", async () => {
        await updateUserInstructor(userEmail, true);
        const userDetailsBefore = await getUserDetails(userEmail, userEmail);
        expect(userDetailsBefore.role).toEqual(INSTRUCTOR_ROLE);

        await updateUserInstructor(userEmail, false);
        const userDetailsAfter = await getUserDetails(userEmail, userEmail);
        expect(userDetailsAfter.role).toEqual(STUDENT_ROLE);
    });

    it("Demote admin to student", async () => {
        const userDetailsBefore = await getUserDetails(adminEmail, adminEmail);
        expect(userDetailsBefore.role).toEqual(INSTRUCTOR_ROLE);
        await updateUserInstructor(adminEmail, false);
        const userDetailsAfter = await getUserDetails(adminEmail, adminEmail);
        expect(userDetailsAfter.role).toEqual(STUDENT_ROLE);
    });

    afterAll(async () => {
        await User.deleteMany({ email: [adminEmail, userEmail] }).exec();
        await disconnect();
    });
});
