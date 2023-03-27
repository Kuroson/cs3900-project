import Course from "@/models/course/course.model";
import Quiz from "@/models/course/quiz/quiz.model";
import User from "@/models/user.model";
import { createCourse } from "@/routes/course/createCourse.route";
import { createQuiz } from "@/routes/quiz/createQuiz.route";
import { deleteQuiz } from "@/routes/quiz/deleteQuiz.route";
import { registerUser } from "@/routes/user/register.route";
import { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import initialiseMongoose from "../testUtil";

describe("Test creating a quiz", () => {
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

    it("Should create a new quiz within the database", async () => {
        const quizId = await createQuiz(
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

        const myQuiz = await Quiz.findById(quizId);

        expect(myQuiz === null).toBe(false);
        expect(myQuiz?.title).toBe("Test quiz");
        expect(myQuiz?.description).toBe("This is the description");
        expect(myQuiz?.maxMarks).toBe(1);
        expect(myQuiz?.open).toBe("2023-03-24T10:00:00+11:00");
        expect(myQuiz?.close).toBe("2023-03-24T11:00:00+11:00");
        expect(myQuiz?.questions.length).toBe(0);

        // Delete the quiz
        await deleteQuiz({ courseId, quizId }, `acc${id}`);
    });

    afterAll(async () => {
        // Clean up
        await User.deleteOne({ firebase_uid: `acc1${id}` }).exec();
        await Course.findByIdAndDelete(courseId).exec();
        await disconnect();
    });
});
