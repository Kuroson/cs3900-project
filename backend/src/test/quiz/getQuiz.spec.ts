import Course from "@/models/course/course.model";
import User from "@/models/user.model";
import { addStudents } from "@/routes/course/addStudents.route";
import { createCourse } from "@/routes/course/createCourse.route";
import { updateCourse } from "@/routes/course/updateCourse.route";
import { createQuestion } from "@/routes/quiz/createQuestion.route";
import { createQuiz } from "@/routes/quiz/createQuiz.route";
import { deleteQuiz } from "@/routes/quiz/deleteQuiz.route";
import { finishQuiz } from "@/routes/quiz/finishQuiz.route";
import { getQuiz } from "@/routes/quiz/getQuiz.route";
import { startQuiz } from "@/routes/quiz/startQuiz.route";
import { updateQuiz } from "@/routes/quiz/updateQuiz.route";
import { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import initialiseMongoose, { genUserTestOnly, registerMultipleUsersTestingOnly } from "../testUtil";

describe("Test finishing a quiz", () => {
    const id = uuidv4();
    const userData = [
        genUserTestOnly("first_name", "last_name", `admin${id}@email.com`, `acc1${id}`),
        genUserTestOnly("first_name", "last_name", `user${id}@email.com`, `acc2${id}`),
    ];

    let courseId: string;

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
        await updateCourse({ courseId, tags: ["test tag"] }, `acc1${id}`);
        await addStudents(courseId, [`user${id}@email.com`], `acc1${id}`);
    });

    const createTestQuiz = async (open: string, close: string) => {
        const quizId = await createQuiz(
            {
                courseId,
                title: "Test quiz",
                description: "This is the description",
                maxMarks: 1,
                open,
                close,
            },
            `acc1${id}`,
        );

        await createQuestion(
            {
                courseId,
                quizId,
                text: "question text",
                type: "choice",
                marks: 2,
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
            `acc1${id}`,
        );

        await createQuestion(
            {
                courseId,
                quizId,
                text: "question 2 text",
                type: "open",
                marks: 2,
                tag: "test tag",
            },
            `acc1${id}`,
        );

        return quizId;
    };

    it("Getting an uncompleted quiz just gives details without questions", async () => {
        const oneDay = 24 * 60 * 60 * 1000;
        const open = new Date(Date.now() - oneDay).toString();
        const close = new Date(Date.now() + oneDay).toString();
        const quizId = await createTestQuiz(open, close);
        const quiz = await getQuiz({ courseId, quizId }, `acc2${id}`);

        expect(quiz === null).toBe(false);
        expect(quiz?.title).toBe("Test quiz");
        expect(quiz?.description).toBe("This is the description");
        expect(quiz?.maxMarks).toBe(1);
        expect(quiz?.open).toBe(open);
        expect(quiz?.close).toBe(close);
        expect(quiz?.questions).toBe(undefined);

        await deleteQuiz({ courseId, quizId }, `acc1${id}`);
    });

    it("Getting an completed quiz before deadline gives just questions", async () => {
        const oneDay = 24 * 60 * 60 * 1000;
        const open = new Date(Date.now() - oneDay).toString();
        const close = new Date(Date.now() + oneDay).toString();
        const quizId = await createTestQuiz(open, close);
        const quizQuestions = await startQuiz({ courseId, quizId }, `acc2${id}`);

        // Make attempt
        await finishQuiz(
            {
                courseId,
                quizId,
                responses: [
                    {
                        questionId: quizQuestions.questions[0]._id,
                        choiceId: quizQuestions.questions[0].choices[0]._id,
                    },
                    {
                        questionId: quizQuestions.questions[1]._id,
                        answer: "Response",
                    },
                ],
            },
            `acc2${id}`,
        );

        const quiz = await getQuiz({ courseId, quizId }, `acc2${id}`);

        expect(quiz === null).toBe(false);
        expect(quiz).toEqual({
            title: "Test quiz",
            description: "This is the description",
            maxMarks: 1,
            open: open,
            close: close,
            questions: [
                {
                    text: "question text",
                    type: "choice",
                    markTotal: 2,
                    tag: "test tag",
                    choices: [
                        {
                            text: "C1",
                            chosen: true,
                        },
                        {
                            text: "C2",
                            chosen: false,
                        },
                    ],
                },
                {
                    text: "question 2 text",
                    type: "open",
                    markTotal: 2,
                    tag: "test tag",
                    response: "Response",
                },
            ],
        });

        await deleteQuiz({ courseId, quizId }, `acc1${id}`);
    });

    it("Getting an completed quiz before deadline gives just questions", async () => {
        const oneDay = 24 * 60 * 60 * 1000;
        let open = new Date(Date.now() - oneDay).toString();
        let close = new Date(Date.now() + oneDay).toString();
        const quizId = await createTestQuiz(open, close);
        const quizQuestions = await startQuiz({ courseId, quizId }, `acc2${id}`);

        // Make attempt
        await finishQuiz(
            {
                courseId,
                quizId,
                responses: [
                    {
                        questionId: quizQuestions.questions[0]._id,
                        choiceId: quizQuestions.questions[0].choices[0]._id,
                    },
                    {
                        questionId: quizQuestions.questions[1]._id,
                        answer: "Response",
                    },
                ],
            },
            `acc2${id}`,
        );

        open = new Date(Date.now() - oneDay * 2).toString();
        close = new Date(Date.now() - oneDay).toString();
        await updateQuiz({ quizId, open, close }, `acc1${id}`);
        const quiz = await getQuiz({ courseId, quizId }, `acc2${id}`);

        expect(quiz === null).toBe(false);
        expect(quiz).toEqual({
            title: "Test quiz",
            description: "This is the description",
            maxMarks: 1,
            open,
            close,
            questions: [
                {
                    text: "question text",
                    type: "choice",
                    markTotal: 2,
                    tag: "test tag",
                    choices: [
                        {
                            text: "C1",
                            chosen: true,
                            correct: true,
                        },
                        {
                            text: "C2",
                            chosen: false,
                            correct: false,
                        },
                    ],
                    markAwarded: 2,
                },
                {
                    text: "question 2 text",
                    type: "open",
                    markTotal: 2,
                    tag: "test tag",
                    response: "Response",
                },
            ],
            marksAwarded: 0.5,
        });

        await deleteQuiz({ courseId, quizId }, `acc1${id}`);
    });

    afterAll(async () => {
        // Clean up
        await User.deleteOne({ firebase_uid: `acc1${id}` }).exec();
        await Course.findByIdAndDelete(courseId).exec();
        await disconnect();
    });
});
