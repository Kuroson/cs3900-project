import { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import Assignment from "@/models/course/assignment/assignment.model";
import Course from "@/models/course/course.model";
import Page from "@/models/course/page/page.model";
import Task from "@/models/course/workloadOverview/Task.model";
import Week from "@/models/course/workloadOverview/week.model";
import User from "@/models/user.model";
import { createAssignment } from "@/routes/assignment/createAssignment.route";
import { deleteAssignment } from "@/routes/assignment/deleteAssignment.route";
import { createCourse } from "@/routes/course/createCourse.route";
import { updateCourse } from "@/routes/course/updateCourse.route";
import { createPage } from "@/routes/page/createPage.route";
import { registerUser } from "@/routes/user/register.route";
import { createTask } from "@/routes/workloadOverview/createTask.route";
import { createWeek } from "@/routes/workloadOverview/createWeek.route";
import initialiseMongoose from "../testUtil";

describe("Test deleting an assignment linked to a task", () => {
    const id = uuidv4();
    let courseId: string;
    let weekId: string;
    let pageId: string;

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

        pageId = await createPage(courseId, "Test page 1", `acc${id}`);

        weekId = await createWeek(
            `${courseId}`,
            pageId,
            "Week 1",
            "Week 1 Description",
            "2023-04-08T12:00:00+10:00",
            `acc${id}`,
        );
    });

    it("Should delete task after assignment is deleted", async () => {
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

        // create a task
        const taskId = await createTask(
            {
                courseId: courseId,
                weekId: weekId,
                title: "Do Task 1",
                description: "Look at week 1",
                assignmentId: assignmentId,
            },
            `acc${id}`,
        );
        let myTask = await Task.findById(taskId);
        expect(myTask === null).toBe(false);
        myAssignment = await Assignment.findById(assignmentId);
        expect(myAssignment?.task.toString()).toBe(taskId.toString());

        // Delete the assignment
        await deleteAssignment({ courseId, assignmentId }, `acc${id}`);

        myAssignment = await Assignment.findById(assignmentId);
        expect(myAssignment === null).toBe(true);
        myCourse = await Course.findById(courseId);
        expect(myCourse?.assignments.includes(assignmentId)).toBe(false);
        myTask = await Task.findById(taskId);
        expect(myTask === null).toBe(true);
    });

    afterAll(async () => {
        // Clean up
        await User.deleteOne({ firebase_uid: `acc${id}` }).exec();
        await Course.findByIdAndDelete(courseId).exec();
        await Page.findByIdAndDelete(pageId).exec();
        await Week.findByIdAndDelete(weekId).exec();
        await disconnect();
    });
});
