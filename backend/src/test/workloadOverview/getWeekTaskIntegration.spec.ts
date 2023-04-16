import Course from "@/models/course/course.model";
import Page from "@/models/course/page/page.model";
import Task from "@/models/course/workloadOverview/Task.model";
import Week from "@/models/course/workloadOverview/week.model";
import User from "@/models/user.model";
import { addStudents } from "@/routes/course/addStudents.route";
import { createCourse } from "@/routes/course/createCourse.route";
import { createOnlineClass } from "@/routes/onlineClasses/createOnlineClass.route";
import { addNewChatMessage } from "@/routes/onlineClasses/sendMessageOnlineClass.route";
import { triggerOnlineClass } from "@/routes/onlineClasses/startOnlineClass.route";
import { createPage } from "@/routes/page/createPage.route";
import { registerUser } from "@/routes/user/register.route";
import { completeTask } from "@/routes/workloadOverview/completeTask.route";
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
    let task1Id: string;
    let task2Id: string;
    let studentId: string;

    let onlineClassId;
    const onlineClassTitle = "Test online class";
    const onlineClassDescription = "This is the description";
    const onlineClassLink = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    const onlineClassDate: number = Date.now();

    const chatMessage1 = "This is a test message";
    const chatMessage2 = "This is a test message2";

    beforeAll(async () => {
        await initialiseMongoose();

        await registerUser("first_name", "last_name", `admin${id}@email.com`, `acc${id}`);
        await registerUser("first_name", "last_name", `student1${id}@email.com`, `acc1${id}`);
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
        await addStudents(courseId, [`student1${id}@email.com`], `acc${id}`);

        pageId = await createPage(courseId, "Test page 1", `acc${id}`);

        weekId = await createWeek(
            `${courseId}`,
            pageId,
            "Week 1",
            "Week 1 Description",
            "2023-04-08T12:00:00+10:00",
            `acc${id}`,
        );
        onlineClassId = await createOnlineClass(
            courseId,
            onlineClassTitle,
            onlineClassDescription,
            onlineClassDate,
            onlineClassLink,
        );
        task1Id = await createTask(
            {
                courseId: courseId,
                weekId: weekId,
                title: "Do Task 1",
                description: "Look at week 1",
                onlineClassId: onlineClassId,
            },
            `acc${id}`,
        );
        task2Id = await createTask(
            {
                courseId: courseId,
                weekId: weekId,
                title: "Do Task 2",
                description: "Look at week 2",
            },
            `acc${id}`,
        );
        await triggerOnlineClass(onlineClassId, true);
        await User.findOne({ email: `student1${id}@email.com` })
            .then((student) => {
                studentId = student?._id;
            })
            .catch(() => null);
    });

    it("Should complete Tasks", async () => {
        let week = await getWeek(courseId, weekId, studentId);
        expect(week).not.toBeNull();
        expect(week.title as string).toEqual("Week 1");
        expect(week.description as string).toEqual("Week 1 Description");
        expect(week.uncompletedTasks.length).toEqual(2);

        expect(week.uncompletedTasks[0].title as string).toEqual("Do Task 1");
        expect(week.uncompletedTasks[0].description as string).toEqual("Look at week 1");

        expect(week.uncompletedTasks[1].title as string).toEqual("Do Task 2");
        expect(week.uncompletedTasks[1].description as string).toEqual("Look at week 2");

        const user = await User.findOne({ email: `student1${id}@email.com` }).exec();
        expect(user).not.toBeNull();
        await addNewChatMessage(onlineClassId, `acc1${id}`, chatMessage1, courseId);

        week = await getWeek(courseId, weekId, studentId);
        expect(week).not.toBeNull();
        expect(week.title as string).toEqual("Week 1");
        expect(week.description as string).toEqual("Week 1 Description");

        expect(week.completedTasks.length).toEqual(1);
        expect(week.completedTasks[0].title as string).toEqual("Do Task 1");
        expect(week.completedTasks[0].description as string).toEqual("Look at week 1");

        expect(week.uncompletedTasks.length).toEqual(1);
        expect(week.uncompletedTasks[0].title as string).toEqual("Do Task 2");
        expect(week.uncompletedTasks[0].description as string).toEqual("Look at week 2");
    });

    afterAll(async () => {
        await User.deleteOne({ firebase_uid: `acc1${id}` }).exec();
        await User.deleteOne({ firebase_uid: `acc1${id}` }).exec();
        await Course.findByIdAndDelete(courseId).exec();
        await Page.findByIdAndDelete(pageId).exec();
        await Week.findByIdAndDelete(weekId).exec();
        await Task.findByIdAndDelete(task1Id).exec();
        await Task.findByIdAndDelete(task2Id).exec();
        await disconnect();
    });
});
