import initialiseMongoose from "../testUtil";

describe("Test creating a course", () => {
    beforeAll(async () => {
        await initialiseMongoose();
    });

    const id = Date.now();

    it("Should create a new course in the database", async () => {}, 10000);

    it("Can successfully create two courses with the same info", async () => {}, 10000);

    afterAll(async () => {
        // Clean up
    });
});
