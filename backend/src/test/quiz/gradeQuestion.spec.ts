import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course/course.model";
import QuestionResponse from "@/models/course/enrolment/questionResponse.model";
import User from "@/models/user.model";
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
import { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import initialiseMongoose, { genUserTestOnly, registerMultipleUsersTestingOnly } from "../testUtil";

describe("Test grading a question submission", () => {
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

    const createTestQuiz = async () => {
        const oneDay = 24 * 60 * 60 * 1000;
        const open = new Date(Date.now() - oneDay).toString();
        const close = new Date(Date.now() + oneDay).toString();
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
                type: "open",
                marks: 2,
                tag: "test tag",
            },
            `acc1${id}`,
        );

        return quizId;
    };

    it("Should save the question as graded", async () => {
        const quizId = await createTestQuiz();
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
                        answer: "Another Response",
                    },
                ],
            },
            `acc2${id}`,
        );

        const submissions = await getSubmissions({ courseId, quizId }, `acc1${id}`);

        expect(submissions.length).toBe(2);

        expect(submissions[0].question.questionId).toEqual(
            quizQuestions.questions[1]._id.toString(),
        );
        expect(submissions[0].responses.length).toBe(1);

        await gradeQuestion(
            {
                questionId: quizQuestions.questions[1]._id,
                responseId: submissions[0].responses[0].responseId,
                mark: 1,
            },
            `acc1${id}`,
        );

        const questionResponse = await QuestionResponse.findById(
            submissions[0].responses[0].responseId,
        );

        expect(questionResponse === null).toBe(false);
        expect(questionResponse?.marked).toBe(true);
        expect(questionResponse?.mark).toBe(1);

        await deleteQuiz({ courseId, quizId }, `acc1${id}`);
    });

    it("Giving a negative mark should throw an error", async () => {
        const quizId = await createTestQuiz();
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
                        answer: "Another Response",
                    },
                ],
            },
            `acc2${id}`,
        );

        const submissions = await getSubmissions({ courseId, quizId }, `acc1${id}`);

        expect(submissions.length).toBe(2);

        expect(submissions[0].question.questionId).toEqual(
            quizQuestions.questions[1]._id.toString(),
        );
        expect(submissions[0].responses.length).toBe(1);

        expect(
            gradeQuestion(
                {
                    questionId: quizQuestions.questions[1]._id,
                    responseId: submissions[0].responses[0].responseId,
                    mark: -1,
                },
                `acc1${id}`,
            ),
        ).rejects.toThrow(HttpException);
    });

    it("Giving a mark above the question max should throw an error", async () => {
        const quizId = await createTestQuiz();
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
                        answer: "Another Response",
                    },
                ],
            },
            `acc2${id}`,
        );

        const submissions = await getSubmissions({ courseId, quizId }, `acc1${id}`);

        expect(submissions.length).toBe(2);

        expect(submissions[0].question.questionId).toEqual(
            quizQuestions.questions[1]._id.toString(),
        );
        expect(submissions[0].responses.length).toBe(1);

        expect(
            gradeQuestion(
                {
                    questionId: quizQuestions.questions[1]._id,
                    responseId: submissions[0].responses[0].responseId,
                    mark: 3,
                },
                `acc1${id}`,
            ),
        ).rejects.toThrow(HttpException);
    });

    afterAll(async () => {
        // Clean up
        await User.deleteOne({ firebase_uid: `acc1${id}` }).exec();
        await Course.findByIdAndDelete(courseId).exec();
        await disconnect();
    });
});
