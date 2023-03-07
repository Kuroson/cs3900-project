import Course from "@/models/course.model";
import { checkAccess } from "@/routes/access.route";
import initialiseMongoose from "../testUtil";

describe("Test checking if user has access to a course", () => {
    beforeAll(async () => {
        await initialiseMongoose();
    });

    it("Admin should have access", async () => {
        const res = await Course.find({
            title: "testCourse",
            description: "this is for testing",
        }).exec();

        expect(res.length).toBeGreaterThan(0);
        const courseId = res[0]._id;

        const canAccess = await checkAccess("test_user", courseId);
        expect(canAccess).toBe(true);
    }, 10000);

    it("Student should not have access", async () => {
        const res = await Course.find({
            title: "testCourse",
            description: "this is for testing",
        }).exec();

        expect(res.length).toBeGreaterThan(0);
        const courseId = res[0]._id;

        const canAccess = await checkAccess("test_user2", courseId);
        expect(canAccess).toBe(false);
    }, 10000);

    it("Student should have access if they are enrolled", async () => {
        const res = await Course.find({
            title: "testCourse",
            description: "this is for testing",
        }).exec();

        expect(res.length).toBeGreaterThan(0);
        const courseId = res[0]._id;

        const canAccess = await checkAccess("test_user3", courseId);
        expect(canAccess).toBe(true);
    }, 10000);
});
