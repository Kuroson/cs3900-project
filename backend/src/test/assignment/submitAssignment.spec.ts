import Course from "@/models/course/course.model";
import AssignmentSubmission from "@/models/course/enrolment/assignmentSubmission.model";
import User from "@/models/user.model";
import { createAssignment } from "@/routes/assignment/createAssignment.route";
import { deleteAssignment } from "@/routes/assignment/deleteAssignment.route";
import { submitAssignment } from "@/routes/assignment/submitAssignment.route";
import { addStudents } from "@/routes/course/addStudents.route";
import { createCourse } from "@/routes/course/createCourse.route";
import { updateCourse } from "@/routes/course/updateCourse.route";
import mongoose, { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import initialiseMongoose, { genUserTestOnly, registerMultipleUsersTestingOnly } from "../testUtil";

describe("Test submitting an assignment", () => {
    const id = uuidv4();
    const userData = [
        genUserTestOnly("first_name", "last_name", `admin${id}@email.com`, `acc1${id}`),
        genUserTestOnly("first_name", "last_name", `user${id}@email.com`, `acc2${id}`),
    ];

    let courseId: string;
    let assignmentId: string;

    beforeAll(async () => {
        await initialiseMongoose();

        // Creates users for testing
        await registerMultipleUsersTestingOnly(userData);

        // Create course info
        courseId = await createCourse(
            {
                code: "TESTING",
                title: "Test",
                session: "T1",
                description: "This is a test course",
                icon: "",
            },
            `acc1${id}`,
        );
        await updateCourse({ courseId, tags: ["tag1", "tag2"] }, `acc1${id}`);
        await addStudents(courseId, [`user${id}@email.com`], `acc1${id}`);

        const oneDay = 24 * 60 * 60 * 1000;
        const deadline = new Date(Date.now() + oneDay).toString();
        assignmentId = await createAssignment(
            {
                courseId,
                title: "Test assignment",
                description: "This is the description",
                deadline: deadline,
                marksAvailable: 1,
                tags: ["tag1", "tag2"],
            },
            `acc1${id}`,
        );
    });

    it("Student submitting assignment", async () => {
        const assignment = await submitAssignment(
            { courseId, assignmentId, title: "test title" },
            `acc2${id}`,
            { fileRef: { name: "TestFile.PNG" }, mimetype: "image/png" },
        );

        expect(assignment.fileType).toBe("image/png");
        expect(assignment.linkToSubmission).toContain("https://storage.googleapis.com/");

        const submission = await AssignmentSubmission.findById(assignment.submissionId);

        expect(submission === null).toBe(false);
        expect(submission?.title).toBe("test title");
        expect(submission?.assignment).toEqual(new mongoose.Types.ObjectId(assignmentId));
        expect(submission?.storedName).toBe("TestFile.PNG");
        expect(submission?.fileType).toBe("image/png");
        expect(submission?.mark).toBe(undefined);
        expect(submission?.comments).toBe(undefined);
    });

    afterAll(async () => {
        // Clean up
        await deleteAssignment({ courseId, assignmentId }, `acc1${id}`);
        await User.deleteOne({ firebase_uid: `acc1${id}` }).exec();
        await User.deleteOne({ firebase_uid: `acc2${id}` }).exec();
        await Course.findByIdAndDelete(courseId).exec();
        await disconnect();
    });
});
