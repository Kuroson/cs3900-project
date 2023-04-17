import { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import Course from "@/models/course/course.model";
import User from "@/models/user.model";
import { addStudents } from "@/routes/course/addStudents.route";
import { createCourse } from "@/routes/course/createCourse.route";
import { updateCourse } from "@/routes/course/updateCourse.route";
import { createQuestion } from "@/routes/quiz/createQuestion.route";
import { createQuiz } from "@/routes/quiz/createQuiz.route";
import { deleteQuiz } from "@/routes/quiz/deleteQuiz.route";
import { finishQuiz } from "@/routes/quiz/finishQuiz.route";
import { getSubmissions } from "@/routes/quiz/getSubmissions.route";
import { startQuiz } from "@/routes/quiz/startQuiz.route";
import initialiseMongoose, { genUserTestOnly, registerMultipleUsersTestingOnly } from "../testUtil";

describe("Test getting quiz submissions", () => {
    const id = uuidv4();
    const userData = [
        genUserTestOnly("first_name", "last_name", `admin${id}@email.com`, `acc1${id}`),
        genUserTestOnly("first_name", "last_name", `user${id}@email.com`, `acc2${id}`),
    ];

    let courseId: string;
    let quizId: string;

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

        const oneDay = 24 * 60 * 60 * 1000;
        const open = new Date(Date.now() - oneDay).toString();
        const close = new Date(Date.now() + oneDay).toString();
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
    });

    it("Should return unmarked submissions for all questions for the given quiz", async () => {
        const quizQuestions = await startQuiz({ courseId, quizId }, `acc2${id}`);

        // Make attempt
        await finishQuiz(
            {
                courseId,
                quizId,
                responses: [
                    {
                        questionId: quizQuestions.questions[0]._id,
                        choiceId: [quizQuestions.questions[0].choices[0]._id],
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
        expect(submissions[0].question.text).toBe("question 2 text");
        expect(submissions[0].question.marks).toBe(2);
        expect(submissions[0].question.tag).toBe("test tag");
        expect(submissions[0].responses.length).toBe(1);
        expect(submissions[0].responses[0].answer).toBe("Response");
        expect(submissions[0].responses[0].studentName).toBe("first_name last_name");

        expect(submissions[1].question.questionId).toEqual(
            quizQuestions.questions[2]._id.toString(),
        );
        expect(submissions[1].question.text).toBe("question 3 text");
        expect(submissions[1].question.marks).toBe(2);
        expect(submissions[1].question.tag).toBe("test tag");
        expect(submissions[1].responses.length).toBe(1);
        expect(submissions[1].responses[0].answer).toBe("Another Response");
    });

    afterAll(async () => {
        // Clean up
        await deleteQuiz({ courseId, quizId }, `acc1${id}`);
        await User.deleteOne({ firebase_uid: `acc1${id}` }).exec();
        await Course.findByIdAndDelete(courseId).exec();
        await disconnect();
    });
});
