import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course/course.model";
import QuizAttempt from "@/models/course/enrolment/quizAttempt.model";
import User from "@/models/user.model";
import { addStudents } from "@/routes/course/addStudents.route";
import { createCourse } from "@/routes/course/createCourse.route";
import { updateCourse } from "@/routes/course/updateCourse.route";
import { createQuestion } from "@/routes/quiz/createQuestion.route";
import { createQuiz } from "@/routes/quiz/createQuiz.route";
import { deleteQuiz } from "@/routes/quiz/deleteQuiz.route";
import { finishQuiz } from "@/routes/quiz/finishQuiz.route";
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

        await createQuestion(
            {
                courseId,
                quizId,
                text: "question 3 text",
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
                    {
                        text: "C3",
                        correct: true,
                    },
                ],
                tag: "test tag",
            },
            `acc1${id}`,
        );

        return quizId;
    };

    it("Finish quiz save student responses", async () => {
        const oneDay = 24 * 60 * 60 * 1000;
        const start = new Date(Date.now() - oneDay).toString();
        const end = new Date(Date.now() + oneDay).toString();
        const quizId = await createTestQuiz(start, end);
        const quizQuestions = await startQuiz({ courseId, quizId }, `acc2${id}`);

        // Make attempt
        await finishQuiz(
            {
                courseId,
                quizId,
                responses: [
                    {
                        questionId: quizQuestions.questions[0]._id,
                        choiceIds: [quizQuestions.questions[0].choices[0]._id.toString()],
                    },
                    {
                        questionId: quizQuestions.questions[1]._id,
                        answer: "Response",
                    },
                    {
                        questionId: quizQuestions.questions[2]._id,
                        choiceIds: [
                            quizQuestions.questions[2].choices[0]._id.toString(),
                            quizQuestions.questions[2].choices[1]._id.toString(),
                        ],
                    },
                ],
            },
            `acc2${id}`,
        );

        const quizAttempt = await QuizAttempt.findOne({ quiz: quizId }).populate({
            path: "responses",
            model: "QuestionResponse",
        });

        expect(quizAttempt === null).toBe(false);
        expect(quizAttempt?.mark).toBe(2);
        expect(quizAttempt?.responses.length).toBe(3);

        expect(quizAttempt?.responses[0].marked).toBe(true);
        expect(quizAttempt?.responses[0].choices).toEqual([
            quizQuestions.questions[0].choices[0]._id,
        ]);
        expect(quizAttempt?.responses[0].answer).toBe(undefined);
        expect(quizAttempt?.responses[0].mark).toBe(2);

        expect(quizAttempt?.responses[1].marked).toBe(false);
        expect(quizAttempt?.responses[1].choices).toEqual([]);
        expect(quizAttempt?.responses[1].answer).toBe("Response");
        expect(quizAttempt?.responses[1].mark).toBe(0);

        expect(quizAttempt?.responses[2].marked).toBe(true);
        expect(quizAttempt?.responses[2].choices).toEqual([
            quizQuestions.questions[2].choices[0]._id,
            quizQuestions.questions[2].choices[1]._id,
        ]);
        expect(quizAttempt?.responses[2].answer).toBe(undefined);
        expect(quizAttempt?.responses[2].mark).toBe(0);

        await deleteQuiz({ courseId, quizId }, `acc1${id}`);
    });

    it("Finishing quiz after closing should give error", async () => {
        const oneDay = 24 * 60 * 60 * 1000;
        let open = new Date(Date.now() - oneDay).toString();
        let close = new Date(Date.now() + oneDay).toString();
        const quizId = await createTestQuiz(open, close);

        const quizQuestions = await startQuiz({ courseId, quizId }, `acc2${id}`);

        open = new Date(Date.now() + oneDay).toString();
        close = new Date(Date.now() + oneDay * 2).toString();
        await updateQuiz({ quizId, open, close }, `acc1${id}`);

        expect(
            finishQuiz(
                {
                    courseId,
                    quizId,
                    responses: [
                        {
                            questionId: quizQuestions.questions[0]._id,
                            choiceIds: [quizQuestions.questions[0].choices[0]._id],
                        },
                        {
                            questionId: quizQuestions.questions[1]._id,
                            answer: "Response",
                        },
                        {
                            questionId: quizQuestions.questions[2]._id,
                            choiceIds: [
                                quizQuestions.questions[2].choices[0]._id,
                                quizQuestions.questions[2].choices[1]._id,
                            ],
                        },
                    ],
                },
                `acc2${id}`,
            ),
        ).rejects.toThrow(HttpException);

        await deleteQuiz({ courseId, quizId }, `acc1${id}`);
    });

    it("Finishing quiz before opening should give error", async () => {
        const oneDay = 24 * 60 * 60 * 1000;
        let open = new Date(Date.now() - oneDay).toString();
        let close = new Date(Date.now() + oneDay).toString();
        const quizId = await createTestQuiz(open, close);

        const quizQuestions = await startQuiz({ courseId, quizId }, `acc2${id}`);

        open = new Date(Date.now() - oneDay * 2).toString();
        close = new Date(Date.now() - oneDay).toString();
        await updateQuiz({ quizId, open, close }, `acc1${id}`);

        expect(
            finishQuiz(
                {
                    courseId,
                    quizId,
                    responses: [
                        {
                            questionId: quizQuestions.questions[0]._id,
                            choiceIds: [quizQuestions.questions[0].choices[0]._id],
                        },
                        {
                            questionId: quizQuestions.questions[1]._id,
                            answer: "Response",
                        },
                        {
                            questionId: quizQuestions.questions[2]._id,
                            choiceIds: [
                                quizQuestions.questions[2].choices[0]._id,
                                quizQuestions.questions[2].choices[1]._id,
                            ],
                        },
                    ],
                },
                `acc2${id}`,
            ),
        ).rejects.toThrow(HttpException);

        await deleteQuiz({ courseId, quizId }, `acc1${id}`);
    });

    it("Finishing already attempted quiz should give error", async () => {
        const oneDay = 24 * 60 * 60 * 1000;
        const start = new Date(Date.now() - oneDay).toString();
        const end = new Date(Date.now() + oneDay).toString();
        const quizId = await createTestQuiz(start, end);
        const quizQuestions = await startQuiz({ courseId, quizId }, `acc2${id}`);

        // Make attempt
        await finishQuiz(
            {
                courseId,
                quizId,
                responses: [
                    {
                        questionId: quizQuestions.questions[0]._id,
                        choiceIds: [quizQuestions.questions[0].choices[0]._id],
                    },
                    {
                        questionId: quizQuestions.questions[1]._id,
                        answer: "Response",
                    },
                    {
                        questionId: quizQuestions.questions[2]._id,
                        choiceIds: [
                            quizQuestions.questions[2].choices[0]._id,
                            quizQuestions.questions[2].choices[1]._id,
                        ],
                    },
                ],
            },
            `acc2${id}`,
        );

        expect(
            finishQuiz(
                {
                    courseId,
                    quizId,
                    responses: [
                        {
                            questionId: quizQuestions.questions[0]._id,
                            choiceIds: [quizQuestions.questions[0].choices[0]._id],
                        },
                        {
                            questionId: quizQuestions.questions[1]._id,
                            answer: "Response",
                        },
                        {
                            questionId: quizQuestions.questions[2]._id,
                            choiceIds: [
                                quizQuestions.questions[2].choices[0]._id,
                                quizQuestions.questions[2].choices[1]._id,
                            ],
                        },
                    ],
                },
                `acc2${id}`,
            ),
        ).rejects.toThrow(HttpException);

        await deleteQuiz({ courseId, quizId }, `acc1${id}`);
    });

    afterAll(async () => {
        // Clean up
        await User.deleteOne({ firebase_uid: `acc1${id}` }).exec();
        await Course.findByIdAndDelete(courseId).exec();
        await disconnect();
    });
});
