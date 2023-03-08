import initialiseMongoose from "../testUtil";

describe("Test recalling a course", () => {
    beforeAll(async () => {
        await initialiseMongoose();
    });

    const id = Date.now();

    it("Can update course information", async () => {}, 10000);

    it("Invalid course ID should throw", async () => {}, 10000);

    afterAll(async () => {
        // Clean up
    });
});
