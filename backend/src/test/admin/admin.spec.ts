import User from "@/models/user.model";
import { checkAdmin } from "@/routes/admin/admin.route";
import { registerUser } from "@/routes/auth/register.route";
import { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import initialiseMongoose, { genUserTestOnly, registerMultipleUsersTestingOnly } from "../testUtil";

describe("Test checking if user is admin", () => {
    const id = uuidv4();

    const userData = [
        genUserTestOnly("first_name", "last_name", `admin${id}@email.com`, `acc1${id}`),
        genUserTestOnly("first_name", "last_name", `user${id}@email.com`, `acc2${id}`),
    ];

    beforeAll(async () => {
        await initialiseMongoose();

        // Creates users for testing
        await registerMultipleUsersTestingOnly(userData);
    });

    it("Should be an admin", async () => {
        const isAdmin = await checkAdmin(`acc1${id}`);
        expect(isAdmin).toBe(true);
    });

    it("Should not be an admin", async () => {
        const isAdmin = await checkAdmin(`acc2${id}`);
        expect(isAdmin).toBe(false);
    });

    afterAll(async () => {
        // Clean up
        await User.deleteMany({ email: userData.map((x) => x.email) });
        await disconnect();
    });
});
