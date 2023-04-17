import mongoose, { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import Course from "@/models/course/course.model";
import User from "@/models/user.model";
import { createAssignment } from "@/routes/assignment/createAssignment.route";
import { deleteAssignment } from "@/routes/assignment/deleteAssignment.route";
import { getAssignments } from "@/routes/assignment/getAssignments.route";
import { addStudents } from "@/routes/course/addStudents.route";
import { createCourse } from "@/routes/course/createCourse.route";
import { updateCourse } from "@/routes/course/updateCourse.route";
import { registerUser } from "@/routes/user/register.route";
import initialiseMongoose from "../testUtil";

describe("Test listing assignments", () => {
    const id = uuidv4();

    let courseId: string;
    const assignments: Array<string> = [];

    beforeAll(async () => {
        await initialiseMongoose();

        // Creates user for testing
        await registerUser("first_name", "last_name", `admin${id}@email.com`, `acc${id}`);

        // Create course info
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
        await addStudents(courseId, [`user${id}@email.com`], `acc${id}`);

        assignments.push(
            await createAssignment(
                {
                    courseId,
                    title: "Test assignment",
                    description: "This is the description",
                    deadline: "2023-03-26T12:00:00+11:00",
                    marksAvailable: 1,
                    tags: ["tag1", "tag2"],
                },
                `acc${id}`,
            ),
        );

        assignments.push(
            await createAssignment(
                {
                    courseId,
                    title: "Another assignment",
                    description: "This is the description",
                    deadline: "2023-03-26T12:00:00+11:00",
                    marksAvailable: 1,
                    tags: ["tag1", "tag2"],
                },
                `acc${id}`,
            ),
        );
    });

    it("Admin getting an assignment returns all its information", async () => {
        const myAssignments = await getAssignments({ courseId }, `acc${id}`);

        expect(myAssignments.length).toBe(2);

        expect(myAssignments).toEqual([
            {
                assignmentId: new mongoose.Types.ObjectId(assignments[0]),
                title: "Test assignment",
                deadline: "2023-03-26T12:00:00+11:00",
                description: "This is the description",
            },
            {
                assignmentId: new mongoose.Types.ObjectId(assignments[1]),
                title: "Another assignment",
                deadline: "2023-03-26T12:00:00+11:00",
                description: "This is the description",
            },
        ]);
    });

    afterAll(async () => {
        // Clean up
        for (const assignmentId of assignments) {
            await deleteAssignment({ courseId, assignmentId }, `acc${id}`);
        }
        await User.deleteOne({ firebase_uid: `acc${id}` }).exec();
        await Course.findByIdAndDelete(courseId).exec();
        await disconnect();
    });
});
