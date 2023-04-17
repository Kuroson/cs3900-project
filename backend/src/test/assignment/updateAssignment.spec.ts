import { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { HttpException } from "@/exceptions/HttpException";
import Assignment from "@/models/course/assignment/assignment.model";
import Course from "@/models/course/course.model";
import User from "@/models/user.model";
import { createAssignment } from "@/routes/assignment/createAssignment.route";
import { deleteAssignment } from "@/routes/assignment/deleteAssignment.route";
import { updateAssignment } from "@/routes/assignment/updateAssignment.route";
import { createCourse } from "@/routes/course/createCourse.route";
import { updateCourse } from "@/routes/course/updateCourse.route";
import { registerUser } from "@/routes/user/register.route";
import initialiseMongoose from "../testUtil";

describe("Test updating an assignment", () => {
    const id = uuidv4();
    let courseId: string;
    let assignmentId: string;

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

        assignmentId = await createAssignment(
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
    });

    it("Should update assignment information within the database", async () => {
        await updateAssignment(
            { courseId, assignmentId, title: "new title", tags: ["tag1"] },
            `acc${id}`,
        );

        const myAssignment = await Assignment.findById(assignmentId);

        expect(myAssignment === null).toBe(false);
        expect(myAssignment?.title).toBe("new title");
        expect(myAssignment?.description).toBe("This is the description");
        expect(myAssignment?.deadline).toBe("2023-03-26T12:00:00+11:00");
        expect(myAssignment?.marksAvailable).toBe(1);
        expect(myAssignment?.tags).toEqual(["tag1"]);
    });

    it("Should fail if tag not in course given", async () => {
        expect(
            updateAssignment(
                {
                    courseId,
                    assignmentId,
                    tags: ["tag1", "invalid tag"],
                },
                `acc${id}`,
            ),
        ).rejects.toThrow(HttpException);
    });

    afterAll(async () => {
        // Clean up
        await deleteAssignment({ courseId, assignmentId }, `acc${id}`);
        await User.deleteOne({ firebase_uid: `acc${id}` }).exec();
        await Course.findByIdAndDelete(courseId).exec();
        await disconnect();
    });
});
