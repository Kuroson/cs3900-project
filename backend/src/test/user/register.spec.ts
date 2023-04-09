import Course from "@/models/course/course.model";
import User from "@/models/user.model";
import { registerUser } from "@/routes/user/register.route";
import { getUserDetails } from "@/routes/user/userDetails.route";
import { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import initialiseMongoose, { genUserTestOnly, registerMultipleUsersTestingOnly } from "../testUtil";

describe("Test creation of new User", () => {
    const id = uuidv4();
    const email1 = `jest-${id}@delete.com`;
    const uid1 = `normal-${id}`;
    const email2 = `admin-${id}@delete.com`;
    const uid2 = `admin-${id}`;
    const email3 = `new-${id}@delete.com`;
    const uid3 = `new-${id}`;

    beforeAll(async () => {
        await initialiseMongoose();
    });

    it("Should create new user", async () => {
        await registerUser(`firstJest${id}`, `lastJest${id}`, email1, uid1);

        const res = await User.find({ email: email1 }).exec();
        expect(res.length).toBe(1);
        const user = res.at(0);
        expect(user?.firebase_uid).toBe(uid1);
        expect(user?.first_name).toBe(`firstJest${id}`);
        expect(user?.last_name).toBe(`lastJest${id}`);
        expect(user?.role).toBe(1); // Non admin
    });

    it("Instructor if admin is in email", async () => {
        await registerUser(`admin${id}`, `lastJest${id}`, email2, uid2);

        const res = await User.find({ email: email2 }).exec();

        expect(res.length).toBe(1);
        const user = res.at(0);
        expect(user?.firebase_uid).toBe(uid2);
        expect(user?.first_name).toBe(`admin${id}`);
        expect(user?.last_name).toBe(`lastJest${id}`);
        expect(user?.role).toBe(0); // admin
    });

    it("Test default value of 0 for kudos", async () => {
        const userId = await registerUser(`firstJest${id}`, `lastJest${id}`, email3, uid3);
        const userDB = await User.findOne({ _id: userId }).catch(() => null);
        expect(userDB).not.toBeNull();
        expect(userDB?.kudos).toEqual(0);

        Course; // Load course model
        const userDetails = await getUserDetails(email3, email3);
        expect(userDetails.kudos).toEqual(0);
    });

    afterAll(async () => {
        // Clean up
        await User.deleteMany({ email: [email1, email2, email3] }).exec();
        await disconnect();
    });
});

describe("Test function - Create multiple users", () => {
    const id = uuidv4();
    const userData = [
        genUserTestOnly("first_name1", "last_name1", `admin${id}@email.com`, `acc${id}`),
        genUserTestOnly("first_name2", "last_name2", `student1${id}@email.com`, `acc1${id}`),
        genUserTestOnly("first_name3", "last_name3", `student2${id}@email.com`, `acc2${id}`),
        genUserTestOnly("first_name4", "last_name4", `student3${id}@email.com`, `acc3${id}`),
    ];

    beforeAll(async () => {
        await initialiseMongoose();
    });

    it("Should create multiple users", async () => {
        await registerMultipleUsersTestingOnly(userData);

        const users = await User.find({ email: userData.map((x) => x.email) }).exec();
        expect(users.length).toEqual(4);
        expect(users.some((x) => x.email === userData[0].email)).toBeTruthy();
        expect(users.some((x) => x.email === userData[1].email)).toBeTruthy();
        expect(users.some((x) => x.email === userData[2].email)).toBeTruthy();
        expect(users.some((x) => x.email === userData[3].email)).toBeTruthy();
    });

    afterAll(async () => {
        await User.deleteMany({ email: userData.map((x) => x.email) });

        await disconnect();
    });
});
