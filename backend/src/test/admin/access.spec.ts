import Course from "@/models/course.model";
import User from "@/models/user.model";
import { checkAccess } from "@/routes/admin/access.route";
import { registerUser } from "@/routes/auth/register.route";
import initialiseMongoose from "../testUtil";

describe("Test checking if user has access to a course", () => {
    const id = Date.now();
    let courseId = "";
    let adminId = "";

    beforeAll(async () => {
        await initialiseMongoose();

        // Creates users for testing
        await registerUser("first_name", "last_name", `admin${id}@email.com`, `acc1${id}`);
        await registerUser("first_name", "last_name", `user${id}@email.com`, `acc2${id}`);
        await registerUser("first_name", "last_name", `user2${id}@email.com`, `acc3${id}`);

        // Create course (with admin as creator)
        adminId = await User.findOne({ firebase_uid: `acc1${id}` })
            .then((res) => {
                if (res === null) throw new Error("Failed to get admin for test");
                return res._id;
            })
            .catch((err) => {
                throw new Error("Failed to get admin for test");
            });

        const myCourse = new Course({
            title: "Test course",
            code: "TEST",
            session: "T1",
            creator: adminId,
        });

        courseId = await myCourse
            .save()
            .then((res) => {
                return res._id;
            })
            .catch((err) => {
                throw new Error("Failed to create course for test");
            });

        // Add course to student
        const myUser = await User.findOne({ firebase_uid: `acc3${id}` });
        if (myUser === null) throw new Error("Failed to get user for test");

        myUser.enrolments.push(myCourse);
        await myUser.save().catch(() => {
            throw new Error("Failed to save updated user for test");
        });
    });

    it("Admin should have access", async () => {
        const canAccess = await checkAccess(`acc1${id}`, courseId);
        expect(canAccess).toBe(true);
    }, 10000);

    it("Student should not have access", async () => {
        const canAccess = await checkAccess(`acc2${id}`, courseId);
        expect(canAccess).toBe(false);
    }, 10000);

    it("Student should have access if they are enrolled", async () => {
        const canAccess = await checkAccess(`acc3${id}`, courseId);
        expect(canAccess).toBe(true);
    }, 10000);

    afterAll(async () => {
        // Clean up
        User.deleteOne({ firebase_uid: `acc1${id}` }).exec();
        User.deleteOne({ firebase_uid: `acc2${id}` }).exec();
        User.deleteOne({ firebase_uid: `acc3${id}` }).exec();
        Course.deleteOne({ title: "Test course", session: "T1", creator: adminId }).exec();
    });
});
