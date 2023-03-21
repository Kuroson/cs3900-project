import Course from "@/models/course/course.model";
import Forum from "@/models/course/forum/forum.model";
import WorkloadOverview from "@/models/course/workloadOverview/WorkloadOverview.model";
import User from "@/models/user.model";
import { checkAccess } from "@/routes/admin/access.route";
import { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import initialiseMongoose, { genUserTestOnly, registerMultipleUsersTestingOnly } from "../testUtil";

describe("Test checking if user has access to a course", () => {
    const id = uuidv4();

    const userData = [
        genUserTestOnly("first_name", "last_name", `admin${id}@email.com`, `acc1${id}`),
        genUserTestOnly("first_name", "last_name", `user${id}@email.com`, `acc2${id}`),
        genUserTestOnly("first_name", "last_name", `user2${id}@email.com`, `acc3${id}`),
    ];

    let courseId = "";
    let adminId = "";

    beforeAll(async () => {
        await initialiseMongoose();

        // Creates users for testing
        await registerMultipleUsersTestingOnly(userData);

        // Create course (with admin as creator)
        adminId = await User.findOne({ firebase_uid: `acc1${id}` })
            .then((res) => {
                if (res === null) throw new Error("Failed to get admin for test");
                return res._id;
            })
            .catch((err) => {
                throw new Error("Failed to get admin for test");
            });

        const courseForum = await new Forum({
            posts: [],
        })
            .save()
            .catch((err) => {
                throw new Error("Failed to create forum for test");
            });

        const courseWorkloadOverview = await new WorkloadOverview({
            weeks: [],
        })
            .save()
            .catch((err) => {
                throw new Error("Failed to create workload overview for test");
            });

        const myCourse = new Course({
            title: "Test course",
            code: "TEST",
            session: "T1",
            creator: adminId,
            forum: courseForum,
            workloadOverview: courseWorkloadOverview,
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
    });

    it("Student should not have access", async () => {
        const canAccess = await checkAccess(`acc2${id}`, courseId);
        expect(canAccess).toBe(false);
    });

    it("Student should have access if they are enrolled", async () => {
        const canAccess = await checkAccess(`acc3${id}`, courseId);
        expect(canAccess).toBe(true);
    });

    afterAll(async () => {
        await User.deleteMany({ firebase_uid: userData.map((x) => x.firebaseUID) }).exec();
        await Course.deleteOne({ title: "Test course", session: "T1", creator: adminId }).exec();
        await disconnect();
    });
});
