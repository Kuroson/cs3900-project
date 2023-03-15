import { HttpException } from "@/exceptions/HttpException";
import User from "@/models/user.model";
import { registerUser } from "@/routes/auth/register.route";
import { getUserDetails } from "@/routes/user/userDetails.route";
import initialiseMongoose from "../testUtil";

describe("Test user details", () => {
    beforeAll(async () => {
        await initialiseMongoose();
    }, 20000);

    const id = Date.now();
    const email1 = `jest-${id}@delete.com`;

    it("Create new user then get details", async () => {
        await registerUser(`firstJest${id}`, `lastJest${id}`, email1, id.toString());
        const userDetails = await getUserDetails(email1);
        expect(userDetails?.firstName).toBe(`firstJest${id}`);
        expect(userDetails?.lastName).toBe(`lastJest${id}`);
        expect(userDetails?.email).toBe(email1);
        expect(userDetails?.role).toBe(1); // Non admin
    });

    it("Request bad email", async () => {
        await expect(getUserDetails("badEmail")).rejects.toThrow(HttpException);
        await getUserDetails("badEmail").catch((err) => {
            expect(err.status).toBe(400); // Bad request
        });
    });

    afterAll(async () => {
        // Clean up
        User.deleteOne({ email: email1 }).exec();
    });
});
