import { checkAdmin } from "@/routes/admin.route";
import initialiseMongoose from "../testUtil";

describe("Test checking if user is admin", () => {
    beforeAll(async () => {
        await initialiseMongoose();
    });

    it("Should be an admin", async () => {
        const isAdmin = await checkAdmin("test_user");

        expect(isAdmin).toBe(true);
    }, 10000);

    it("Should not be an admin", async () => {
        const isAdmin = await checkAdmin("test_user2");

        expect(isAdmin).toBe(false);
    }, 10000);
});
