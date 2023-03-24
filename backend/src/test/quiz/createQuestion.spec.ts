import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course/course.model";
import Question from "@/models/course/quiz/question.model";
import User from "@/models/user.model";
import { createCourse } from "@/routes/course/createCourse.route";
import { updateCourse } from "@/routes/course/updateCourse.route";
import { createQuestion } from "@/routes/quiz/createQuestion.route";
import { createQuiz } from "@/routes/quiz/createQuiz.route";
import { deleteQuestion } from "@/routes/quiz/deleteQuestion.route";
import { deleteQuiz } from "@/routes/quiz/deleteQuiz.route";
import { registerUser } from "@/routes/user/register.route";
import { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import initialiseMongoose from "../testUtil";

describe("Test creating a question", () => {
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

    it("Should create a new multiple choice question", async () => {
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

        const myQuestion = await Question.findById(questionId).populate({
            path: "choices",
            model: "Choice",
        });

        expect(myQuestion === null).toBe(false);
        expect(myQuestion?.text).toBe("question text");
        expect(myQuestion?.type).toBe("choice");
        expect(myQuestion?.marks).toBe(1);
        expect(myQuestion?.tag).toBe("test tag");
        expect(myQuestion?.choices.length).toBe(2);

        await myQuestion?.choices.forEach((choice) => {
            ["C1", "C2"].includes(choice.text);
        });

        // Delete the question
        await deleteQuestion({ quizId, questionId }, `acc${id}`);
    });

    it("Should create a new multiple choice question", async () => {
        const questionId = await createQuestion(
            {
                courseId,
                quizId,
                text: "question text",
                type: "open",
                marks: 1,
                tag: "test tag",
            },
            `acc${id}`,
        );

        const myQuestion = await Question.findById(questionId).populate({
            path: "choices",
            model: "Choice",
        });

        expect(myQuestion === null).toBe(false);
        expect(myQuestion?.text).toBe("question text");
        expect(myQuestion?.type).toBe("open");
        expect(myQuestion?.marks).toBe(1);
        expect(myQuestion?.tag).toBe("test tag");
        expect(myQuestion?.choices.length).toBe(0);

        // Delete the question
        await deleteQuestion({ quizId, questionId }, `acc${id}`);
    });

    it("Invalid course tag should fail", async () => {
        expect(
            createQuestion(
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
                    tag: "invalid tag",
                },
                `acc${id}`,
            ),
        ).rejects.toThrow(HttpException);
    });

    it("Invalid question type should fail", async () => {
        expect(
            createQuestion(
                {
                    courseId,
                    quizId,
                    text: "question text",
                    type: "invalid",
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
            ),
        ).rejects.toThrow(HttpException);
    });

    it("Choices must be given for multiple choice", async () => {
        expect(
            createQuestion(
                {
                    courseId,
                    quizId,
                    text: "question text",
                    type: "choice",
                    marks: 1,
                    tag: "test tag",
                },
                `acc${id}`,
            ),
        ).rejects.toThrow(HttpException);
    });

    afterAll(async () => {
        // Clean up
        await deleteQuiz({ courseId, quizId }, `acc${id}`);
        await User.deleteOne({ firebase_uid: `acc1${id}` }).exec();
        await Course.findByIdAndDelete(courseId).exec();
        await disconnect();
    });
});
