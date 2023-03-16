import User from "@/models/user.model";
import { checkAdmin } from "@/routes/admin/admin.route";
import { registerUser } from "@/routes/auth/register.route";
import { v4 as uuidv4 } from "uuid";
import initialiseMongoose from "../testUtil";

describe("Test checking if user is admin", () => {
    const id = uuidv4();

    beforeAll(async () => {
        await initialiseMongoose();

        // Creates users for testing
        await registerUser("first_name", "last_name", `admin${id}@email.com`, `acc1${id}`);
        await registerUser("first_name", "last_name", `user${id}@email.com`, `acc2${id}`);
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
        User.deleteOne({ firebase_uid: `acc1${id}` }).exec();
        User.deleteOne({ firebase_uid: `acc2${id}` }).exec();
    });
});
