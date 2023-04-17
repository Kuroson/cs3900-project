import { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import Course from "@/models/course/course.model";
import User from "@/models/user.model";
import { createAssignment } from "@/routes/assignment/createAssignment.route";
import { deleteAssignment } from "@/routes/assignment/deleteAssignment.route";
import { getAssignment } from "@/routes/assignment/getAssignment.route";
import { addStudents } from "@/routes/course/addStudents.route";
import { createCourse } from "@/routes/course/createCourse.route";
import { updateCourse } from "@/routes/course/updateCourse.route";
import initialiseMongoose, { genUserTestOnly, registerMultipleUsersTestingOnly } from "../testUtil";

describe("Test getting an assignment", () => {
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

        assignmentId = await createAssignment(
            {
                courseId,
                title: "Test assignment",
                description: "This is the description",
                deadline: "2023-03-26T12:00:00+11:00",
                marksAvailable: 1,
                tags: ["tag1", "tag2"],
            },
            `acc1${id}`,
        );
    });

    it("Admin getting an assignment returns all its information", async () => {
        const assignment = await getAssignment({ courseId, assignmentId }, `acc1${id}`);

        expect(assignment === null).toBe(false);
        expect(assignment?.title).toBe("Test assignment");
        expect(assignment?.description).toBe("This is the description");
        expect(assignment?.deadline).toBe("2023-03-26T12:00:00+11:00");
        expect(assignment?.marksAvailable).toBe(1);
        expect(assignment?.tags).toEqual(["tag1", "tag2"]);
        expect(assignment?.submission).toBe(undefined);
    });

    it("Student getting an assignment without submission should get just details", async () => {
        const assignment = await getAssignment({ courseId, assignmentId }, `acc2${id}`);

        expect(assignment === null).toBe(false);
        expect(assignment?.title).toBe("Test assignment");
        expect(assignment?.description).toBe("This is the description");
        expect(assignment?.deadline).toBe("2023-03-26T12:00:00+11:00");
        expect(assignment?.marksAvailable).toBe(1);
        expect(assignment?.tags).toEqual(["tag1", "tag2"]);
        expect(assignment?.submission).toBe(undefined);
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
