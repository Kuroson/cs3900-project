import User from "@/models/user.model";
import { registerUser } from "@/routes/auth/register.route";
import initialiseMongoose from "../testUtil";

describe("Test creation of new User", () => {
    const id = Date.now();
    const email1 = `jest-${id}@delete.com`;
    const email2 = `admin-${id}@delete.com`;

    beforeAll(async () => {
        await initialiseMongoose();
    });

    it("Should create new user", async () => {
        await registerUser(`firstJest${id}`, `lastJest${id}`, email1, id.toString());

        const res = await User.find({ email: email1 }).exec();
        expect(res.length).toBe(1);
        const user = res.at(0);
        expect(user?.firebase_uid).toBe(id.toString());
        expect(user?.first_name).toBe(`firstJest${id}`);
        expect(user?.last_name).toBe(`lastJest${id}`);
        expect(user?.role).toBe(1); // Non admin
    });

    it("Instructor if admin is in email", async () => {
        const id = Date.now();
        await registerUser(`admin${id}`, `lastJest${id}`, email2, id.toString());

        const res = await User.find({ email: email2 }).exec();

        expect(res.length).toBe(1);
        const user = res.at(0);
        expect(user?.firebase_uid).toBe(id.toString());
        expect(user?.first_name).toBe(`admin${id}`);
        expect(user?.last_name).toBe(`lastJest${id}`);
        expect(user?.role).toBe(0); // admin
    });

    afterAll(async () => {
        // Clean up
        // const testRegex = new RegExp(/\b[\w\.-]+@test\.com\b/);
        User.deleteOne({ email: email1 }).exec();
        User.deleteOne({ email: email2 }).exec();
    });
});
