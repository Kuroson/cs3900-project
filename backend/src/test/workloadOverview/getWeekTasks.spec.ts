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
import { createQuiz } from "@/routes/quiz/createQuiz.route";
import { deleteQuiz } from "@/routes/quiz/deleteQuiz.route";
import { registerUser } from "@/routes/user/register.route";
import { createTask } from "@/routes/workloadOverview/createTask.route";
import { createWeek } from "@/routes/workloadOverview/createWeek.route";
import { getWeek } from "@/routes/workloadOverview/getWeek.route";
import { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import initialiseMongoose from "../testUtil";

describe("Test getting a week of courses", () => {
    const id = uuidv4();
    let courseId: string;
    let pageId: string;
    let weekId: string;
    let assignmentId: string;
    let quizId: string;
    let task1Id: string;
    let task2Id: string;

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

        quizId = await createQuiz(
            {
                courseId,
                title: "Test quiz",
                description: "This is the description",
                maxMarks: 1,
                open: "2023-03-24T10:00:00+11:00",
                close: "2023-03-24T11:00:00+11:00",
            },
            `acc${id}`,
        );
        task1Id = await createTask(
            {
                weekId: weekId,
                title: "Do Assignment 1",
                description: "Look at week 1",
                assignmentId: assignmentId,
            },
            `acc${id}`,
        );
        task2Id = await createTask(
            { weekId: weekId, title: "Do Quiz 1", description: "Look at week 2", quizId: quizId },
            `acc${id}`,
        );
    });

    it("Should retrieve a week's worth of tasks", async () => {
        const week = await getWeek(courseId, weekId);
        expect(week).not.toBeNull();
        expect(week.title as string).toEqual("Week 1");
        expect(week.description as string).toEqual("Week 1 Description");
        expect(week.tasks.length).toEqual(2);

        expect(week.tasks[0].title as string).toEqual("Do Assignment 1");
        expect(week.tasks[0].description as string).toEqual("Look at week 1");
        expect(week.tasks[0].assignment._id as string).toEqual(assignmentId);

        expect(week.tasks[1].title as string).toEqual("Do Quiz 1");
        expect(week.tasks[1].description as string).toEqual("Look at week 2");
        expect(week.tasks[1].quiz._id as string).toEqual(quizId);

        await deleteQuiz({ courseId, quizId }, `acc${id}`);
        await deleteAssignment({ courseId, assignmentId }, `acc${id}`);
    });

    afterAll(async () => {
        await User.deleteOne({ firebase_uid: `acc1${id}` }).exec();
        await Course.findByIdAndDelete(courseId).exec();
        await Page.findByIdAndDelete(pageId).exec();
        await Week.findByIdAndDelete(weekId).exec();
        await Task.findByIdAndDelete(task1Id).exec();
        await Task.findByIdAndDelete(task2Id).exec();
        await disconnect();
    });
});
