import { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import Course from "@/models/course/course.model";
import User from "@/models/user.model";
import { createCourse } from "@/routes/course/createCourse.route";
import { updateCourse } from "@/routes/course/updateCourse.route";
import { createQuestion } from "@/routes/quiz/createQuestion.route";
import { createQuiz } from "@/routes/quiz/createQuiz.route";
import { deleteQuestion } from "@/routes/quiz/deleteQuestion.route";
import { deleteQuiz } from "@/routes/quiz/deleteQuiz.route";
import { getQuestions } from "@/routes/quiz/getQuestions.route";
import { registerUser } from "@/routes/user/register.route";
import initialiseMongoose from "../testUtil";

describe("Test admin getting quiz question", () => {
    const id = uuidv4();
    let courseId: string;
    let quizId: string;
    const questions: Array<string> = [];

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

        questions.push(
            await createQuestion(
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
            ),
        );
        questions.push(
            await createQuestion(
                {
                    courseId,
                    quizId,
                    text: "question 2 text",
                    type: "open",
                    marks: 1,
                    tag: "test tag",
                },
                `acc${id}`,
            ),
        );
    });

    it("Should list out all questions", async () => {
        const quizQuestions = await getQuestions({ quizId }, `acc${id}`);

        expect(quizQuestions === null).toBe(false);
        expect(quizQuestions?.title).toBe("Test quiz");
        expect(quizQuestions?.description).toBe("This is the description");
        expect(quizQuestions?.maxMarks).toBe(1);
        expect(quizQuestions?.open).toBe("2023-03-24T10:00:00+11:00");
        expect(quizQuestions?.close).toBe("2023-03-24T11:00:00+11:00");
        expect(quizQuestions?.questions.length).toBe(2);

        expect(quizQuestions?.questions[0].text).toBe("question text");
        expect(quizQuestions?.questions[0].type).toBe("choice");
        expect(quizQuestions?.questions[0].marks).toBe(1);
        expect(quizQuestions?.questions[0].tag).toBe("test tag");
        expect(quizQuestions?.questions[0].choices.length).toBe(2);
        expect(quizQuestions?.questions[0].choices[0].text).toBe("C1");
        expect(quizQuestions?.questions[0].choices[0].correct).toBe(true);
        expect(quizQuestions?.questions[0].choices[1].text).toBe("C2");
        expect(quizQuestions?.questions[0].choices[1].correct).toBe(false);

        expect(quizQuestions?.questions[1].text).toBe("question 2 text");
        expect(quizQuestions?.questions[1].type).toBe("open");
        expect(quizQuestions?.questions[1].marks).toBe(1);
        expect(quizQuestions?.questions[1].tag).toBe("test tag");
    });

    afterAll(async () => {
        // Clean up
        for (const questionId of questions) {
            await deleteQuestion({ quizId, questionId }, `acc${id}`);
        }
        await deleteQuiz({ courseId, quizId }, `acc${id}`);
        await User.deleteOne({ firebase_uid: `acc1${id}` }).exec();
        await Course.findByIdAndDelete(courseId).exec();
        await disconnect();
    });
});
