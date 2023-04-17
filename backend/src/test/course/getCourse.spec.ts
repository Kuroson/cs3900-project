/* eslint-disable @typescript-eslint/no-explicit-any */
import { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import Course from "@/models/course/course.model";
import Post from "@/models/course/forum/post.model";
import OnlineClass from "@/models/course/onlineClass/onlineClass.model";
import Page from "@/models/course/page/page.model";
import User from "@/models/user.model";
import { createCourse } from "@/routes/course/createCourse.route";
import { getCourse } from "@/routes/course/getCourse.route";
import { updateCourse } from "@/routes/course/updateCourse.route";
import { registerUser } from "@/routes/user/register.route";
import initialiseMongoose from "../testUtil";

describe("Test getting course details", () => {
    const id = uuidv4();
    let courseId: string;

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
    });

    it("Test kudosValues exists in courseDetails", async () => {
        Page;
        OnlineClass;
        Post;
        const courseData = await getCourse(courseId, `acc${id}`);
        expect(courseData.kudosValues).toBeDefined();
        expect(courseData.kudosValues.forumPostAnswer).toEqual(100); // default value of 100
    });

    it("Update KudosValues and see if it is reflected in courseDetails", async () => {
        Page;
        OnlineClass;
        Post;
        const payload = {
            courseId,
            kudosValues: {
                quizCompletion: 500,
                assignmentCompletion: 500,
                weeklyTaskCompletion: 500,
                forumPostCreation: 500,
                forumPostAnswer: 500,
                forumPostCorrectAnswer: 500,
                attendance: 500,
            },
        };
        await updateCourse(payload, `acc${id}`);

        const courseData = await getCourse(courseId, `acc${id}`);
        expect(courseData.kudosValues).toBeDefined();
        expect(courseData.kudosValues.forumPostAnswer).toEqual(500);
    });

    afterAll(async () => {
        // Clean up
        await Course.findByIdAndDelete(courseId).exec();
        await User.deleteOne({ firebase_uid: `acc1${id}` }).exec();
        await disconnect();
    });
});
