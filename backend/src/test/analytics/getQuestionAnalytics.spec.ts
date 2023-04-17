import { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import Course from "@/models/course/course.model";
import { QuizInterfaceStudent } from "@/models/course/quiz/quiz.model";
import User from "@/models/user.model";
import { getQuestionAnalytics } from "@/routes/analytics/getQuestionAnalytics.route";
import { addStudents } from "@/routes/course/addStudents.route";
import { createCourse } from "@/routes/course/createCourse.route";
import { updateCourse } from "@/routes/course/updateCourse.route";
import { createQuestion } from "@/routes/quiz/createQuestion.route";
import { createQuiz } from "@/routes/quiz/createQuiz.route";
import { deleteQuiz } from "@/routes/quiz/deleteQuiz.route";
import { finishQuiz } from "@/routes/quiz/finishQuiz.route";
import { getSubmissions } from "@/routes/quiz/getSubmissions.route";
import { gradeQuestion } from "@/routes/quiz/gradeQuestion.route";
import { startQuiz } from "@/routes/quiz/startQuiz.route";
import { updateQuiz } from "@/routes/quiz/updateQuiz.route";
import initialiseMongoose, { genUserTestOnly, registerMultipleUsersTestingOnly } from "../testUtil";

describe("Test getting question analytics", () => {
    const id = uuidv4();
    const userData = [
        genUserTestOnly("first_name", "last_name", `admin${id}@email.com`, `acc1${id}`),
        genUserTestOnly("first_name", "last_name", `user${id}@email.com`, `acc2${id}`),
    ];

    let courseId: string;
    let quizId: string;
    let quizQuestions: QuizInterfaceStudent;

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
        await updateCourse({ courseId, tags: ["tag1", "tag2", "tag3", "tag4"] }, `acc1${id}`);
        await addStudents(courseId, [`user${id}@email.com`], `acc1${id}`);

        // Create quiz
        const oneDay = 24 * 60 * 60 * 1000;
        const open = new Date(Date.now() - oneDay).toString();
        let close = new Date(Date.now() + oneDay).toString();
        quizId = await createQuiz(
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
                tag: "tag1",
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
                tag: "tag2",
            },
            `acc1${id}`,
        );

        await createQuestion(
            {
                courseId,
                quizId,
                text: "another question text",
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
                tag: "tag1",
            },
            `acc1${id}`,
        );

        // Attempt quiz
        quizQuestions = await startQuiz({ courseId, quizId }, `acc2${id}`);
        await finishQuiz(
            {
                courseId,
                quizId,
                responses: [
                    {
                        questionId: quizQuestions.questions[0]._id,
                        choiceId: [quizQuestions.questions[0].choices[0]._id.toString()],
                    },
                    {
                        questionId: quizQuestions.questions[1]._id,
                        answer: "Response",
                    },
                    {
                        questionId: quizQuestions.questions[2]._id,
                        choiceId: [
                            quizQuestions.questions[2].choices[0]._id.toString(),
                            quizQuestions.questions[2].choices[1]._id.toString(),
                        ],
                    },
                ],
            },
            `acc2${id}`,
        );

        // Grade quiz
        const submissions = await getSubmissions({ courseId, quizId }, `acc1${id}`);

        await gradeQuestion(
            {
                questionId: quizQuestions.questions[1]._id,
                responseId: submissions[0].responses[0].responseId,
                mark: 0.5,
            },
            `acc1${id}`,
        );

        // Update quiz
        const oneMin = 60 * 1000;
        close = new Date(Date.now() - oneMin).toString();
        await updateQuiz({ quizId, close }, `acc1${id}`);
    });

    it("Should get a summary of incorrect questions", async () => {
        const questions = await getQuestionAnalytics({ courseId }, `acc2${id}`);

        expect(questions).toEqual({
            questions: [
                {
                    _id: quizQuestions.questions[1]._id,
                    text: "question 2 text",
                    tag: "tag2",
                    type: "open",
                    marks: 2,
                    markAwarded: 0.5,
                    response: "Response",
                },
                {
                    _id: quizQuestions.questions[2]._id,
                    text: "another question text",
                    tag: "tag1",
                    type: "choice",
                    marks: 2,
                    markAwarded: 0,
                    choices: [
                        {
                            _id: quizQuestions.questions[2].choices[0]._id,
                            text: "C1",
                            correct: true,
                            chosen: true,
                        },
                        {
                            _id: quizQuestions.questions[2].choices[1]._id,
                            text: "C2",
                            correct: false,
                            chosen: true,
                        },
                        {
                            _id: quizQuestions.questions[2].choices[2]._id,
                            text: "C3",
                            correct: true,
                            chosen: false,
                        },
                    ],
                },
            ],
        });
    });

    afterAll(async () => {
        // Clean up
        await deleteQuiz({ courseId, quizId }, `acc1${id}`);
        await User.deleteOne({ firebase_uid: `acc1${id}` }).exec();
        await Course.findByIdAndDelete(courseId).exec();
        await disconnect();
    });
});
