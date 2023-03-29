import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course/course.model";
import User from "@/models/user.model";
import { addStudents } from "@/routes/course/addStudents.route";
import { createCourse } from "@/routes/course/createCourse.route";
import { updateCourse } from "@/routes/course/updateCourse.route";
import { createQuestion } from "@/routes/quiz/createQuestion.route";
import { createQuiz } from "@/routes/quiz/createQuiz.route";
import { deleteQuiz } from "@/routes/quiz/deleteQuiz.route";
import { finishQuiz } from "@/routes/quiz/finishQuiz.route";
import { startQuiz } from "@/routes/quiz/startQuiz.route";
import { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import initialiseMongoose, { genUserTestOnly, registerMultipleUsersTestingOnly } from "../testUtil";

describe("Test starting a quiz", () => {
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
            `acc1${id}`,
        );

        await createQuestion(
            {
                courseId,
                quizId,
                text: "question 2 text",
                type: "open",
                marks: 1,
                tag: "test tag",
            },
            `acc1${id}`,
        );

        return quizId;
    };

    it("Starting quiz should give student view of questions", async () => {
        const oneDay = 24 * 60 * 60 * 1000;
        const start = new Date(Date.now() - oneDay).toString();
        const end = new Date(Date.now() + oneDay).toString();
        const quizId = await createTestQuiz(start, end);
        const quizQuestions = await startQuiz({ courseId, quizId }, `acc2${id}`);

        expect(quizQuestions === null).toBe(false);
        expect(quizQuestions?.title).toBe("Test quiz");
        expect(quizQuestions?.description).toBe("This is the description");
        expect(quizQuestions?.maxMarks).toBe(1);
        expect(quizQuestions?.open).toBe(start);
        expect(quizQuestions?.close).toBe(end);
        expect(quizQuestions?.questions.length).toBe(2);

        expect(quizQuestions?.questions[0].text).toBe("question text");
        expect(quizQuestions?.questions[0].type).toBe("choice");
        expect(quizQuestions?.questions[0].marks).toBe(1);
        expect(quizQuestions?.questions[0].tag).toBe("test tag");
        expect(quizQuestions?.questions[0].choices.length).toBe(2);
        expect(quizQuestions?.questions[0].choices[0].text).toBe("C1");
        expect(quizQuestions?.questions[0].choices[0].correct).toBe(undefined);
        expect(quizQuestions?.questions[0].choices[1].text).toBe("C2");
        expect(quizQuestions?.questions[0].choices[1].correct).toBe(undefined);

        expect(quizQuestions?.questions[1].text).toBe("question 2 text");
        expect(quizQuestions?.questions[1].type).toBe("open");
        expect(quizQuestions?.questions[1].marks).toBe(1);
        expect(quizQuestions?.questions[1].tag).toBe("test tag");

        await deleteQuiz({ courseId, quizId }, `acc1${id}`);
    });

    it("Starting quiz after closing should give error", async () => {
        const oneDay = 24 * 60 * 60 * 1000;
        const start = new Date(Date.now() + oneDay).toString();
        const end = new Date(Date.now() + oneDay * 2).toString();
        const quizId = await createTestQuiz(start, end);
        expect(startQuiz({ courseId, quizId }, `acc2${id}`)).rejects.toThrow(HttpException);

        await deleteQuiz({ courseId, quizId }, `acc1${id}`);
    });

    it("Starting quiz before opening should give error", async () => {
        const oneDay = 24 * 60 * 60 * 1000;
        const start = new Date(Date.now() - oneDay * 2).toString();
        const end = new Date(Date.now() - oneDay).toString();
        const quizId = await createTestQuiz(start, end);
        expect(startQuiz({ courseId, quizId }, `acc2${id}`)).rejects.toThrow(HttpException);

        await deleteQuiz({ courseId, quizId }, `acc1${id}`);
    });

    it("Starting already attempted quiz should give error", async () => {
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
                ],
            },
            `acc2${id}`,
        );

        expect(startQuiz({ courseId, quizId }, `acc2${id}`)).rejects.toThrow(HttpException);

        await deleteQuiz({ courseId, quizId }, `acc1${id}`);
    });

    afterAll(async () => {
        // Clean up
        await User.deleteOne({ firebase_uid: `acc1${id}` }).exec();
        await Course.findByIdAndDelete(courseId).exec();
        await disconnect();
    });
});
