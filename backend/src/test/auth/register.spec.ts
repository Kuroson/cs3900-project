import User from "@/models/user.model";
import { registerUser } from "@/routes/auth/register.route";
import initialiseMongoose from "../testUtil";

describe("Test creation of new User", () => {
    beforeAll(async () => {
        await initialiseMongoose();
    });

    it("Should create new user", async () => {
        const id = Date.now();
        await registerUser(`firstJest${id}`, `lastJest${id}`, `jest-${id}@test.com`, id.toString());

        const res = await User.find({ email: `jest-${id}@test.com` }).exec();
        expect(res.length).toBe(1);
        const user = res.at(0);
        expect(user?.firebase_uid).toBe(id.toString());
        expect(user?.first_name).toBe(`firstJest${id}`);
        expect(user?.last_name).toBe(`lastJest${id}`);
        expect(user?.role).toBe(1); // Non admin
    }, 10000);

    it("Instructor if admin is in email", async () => {
        const id = Date.now();
        await registerUser(`admin${id}`, `lastJest${id}`, `admin-${id}@test.com`, id.toString());

        const res = await User.find({ email: `admin-${id}@test.com` }).exec();

        expect(res.length).toBe(1);
        const user = res.at(0);
        expect(user?.firebase_uid).toBe(id.toString());
        expect(user?.first_name).toBe(`admin${id}`);
        expect(user?.last_name).toBe(`lastJest${id}`);
        expect(user?.role).toBe(0); // admin
    });
});
