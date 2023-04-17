import { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import Course from "@/models/course/course.model";
import Question from "@/models/course/quiz/question.model";
import Quiz from "@/models/course/quiz/quiz.model";
import User from "@/models/user.model";
import { createCourse } from "@/routes/course/createCourse.route";
import { updateCourse } from "@/routes/course/updateCourse.route";
import { createQuestion } from "@/routes/quiz/createQuestion.route";
import { createQuiz } from "@/routes/quiz/createQuiz.route";
import { deleteQuestion } from "@/routes/quiz/deleteQuestion.route";
import { deleteQuiz } from "@/routes/quiz/deleteQuiz.route";
import { registerUser } from "@/routes/user/register.route";
import initialiseMongoose from "../testUtil";

describe("Test deleting a question", () => {
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
        await updateCourse({ courseId, tags: ["test tag"] }, `acc${id}`);

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
    });

    it("Should delete question after creation", async () => {
        const questionId = await createQuestion(
            {
                courseId,
                quizId,
                text: "question text",
                type: "choice",
                marks: 1,
                choices: [
                    {
                        text: "C1",
                        correct: true,
                    },
                    {
                        text: "C2",
                        correct: false,
                    },
                ],
                tag: "test tag",
            },
            `acc${id}`,
        );

        let myQuiz = await Quiz.findById(quizId);
        let myQuestion = await Question.findById(questionId);

        expect(myQuestion === null).toBe(false);
        expect(myQuiz?.questions.length).toBe(1);

        await deleteQuestion({ quizId, questionId }, `acc${id}`);

        myQuiz = await Quiz.findById(quizId);
        myQuestion = await Question.findById(questionId);

        expect(myQuestion === null).toBe(true);
        expect(myQuiz?.questions.length).toBe(0);
    });

    afterAll(async () => {
        // Clean up
        await deleteQuiz({ courseId, quizId }, `acc${id}`);
        await User.deleteOne({ firebase_uid: `acc1${id}` }).exec();
        await Course.findByIdAndDelete(courseId).exec();
        await disconnect();
    });
});
