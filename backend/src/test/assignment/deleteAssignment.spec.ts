import { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import Assignment from "@/models/course/assignment/assignment.model";
import Course from "@/models/course/course.model";
import User from "@/models/user.model";
import { createAssignment } from "@/routes/assignment/createAssignment.route";
import { deleteAssignment } from "@/routes/assignment/deleteAssignment.route";
import { createCourse } from "@/routes/course/createCourse.route";
import { updateCourse } from "@/routes/course/updateCourse.route";
import { registerUser } from "@/routes/user/register.route";
import initialiseMongoose from "../testUtil";

describe("Test deleting an assignment", () => {
    const id = uuidv4();
    let courseId: string;
    let quizId: string;

    beforeAll(async () => {
        await initialiseMongoose();

        await registerUser("first_name", "last_name", `admin${id}@email.com`, `acc${id}`);

        courseId = await createCourse(
            {
                code: "TEST",
                title: "Test",
                session: "T1",
                description: "This is a test course",
                icon: "",
            },
            `acc${id}`,
        );
        await updateCourse({ courseId, tags: ["tag1", "tag2"] }, `acc${id}`);
    });

    it("Should delete question after creation", async () => {
        const assignmentId = await createAssignment(
            {
                courseId,
                title: "Test assignment",
                description: "This is the description",
                deadline: "2023-03-26T12:00:00+11:00",
                marksAvailable: 1,
                tags: ["tag1", "tag2"],
            },
            `acc${id}`,
        );

        let myAssignment = await Assignment.findById(assignmentId);
        expect(myAssignment === null).toBe(false);
        let myCourse = await Course.findById(courseId);
        expect(myCourse?.assignments.includes(assignmentId)).toBe(true);

        // Delete the assignment
        await deleteAssignment({ courseId, assignmentId }, `acc${id}`);

        myAssignment = await Assignment.findById(assignmentId);
        expect(myAssignment === null).toBe(true);
        myCourse = await Course.findById(courseId);
        expect(myCourse?.assignments.includes(assignmentId)).toBe(false);
    });

    afterAll(async () => {
        // Clean up
        await User.deleteOne({ firebase_uid: `acc${id}` }).exec();
        await Course.findByIdAndDelete(courseId).exec();
        await disconnect();
    });
});
