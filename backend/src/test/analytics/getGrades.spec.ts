import Course from "@/models/course/course.model";
import User from "@/models/user.model";
import { getGrades } from "@/routes/analytics/getGrades.route";
import { createAssignment } from "@/routes/assignment/createAssignment.route";
import { deleteAssignment } from "@/routes/assignment/deleteAssignment.route";
import { gradeAssignment } from "@/routes/assignment/gradeAssignment.route";
import { submitAssignment } from "@/routes/assignment/submitAssignment.route";
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
import { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import initialiseMongoose, { genUserTestOnly, registerMultipleUsersTestingOnly } from "../testUtil";

describe("Test getting student grades", () => {
    const id = uuidv4();
    const userData = [
        genUserTestOnly("first_name", "last_name", `admin${id}@email.com`, `acc1${id}`),
        genUserTestOnly("first_name", "last_name", `user${id}@email.com`, `acc2${id}`),
    ];

    let courseId: string;
    let quizId: string;
    let assignmentId1: string;
    let assignmentId2: string;

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

        // Attempt quiz
        const quizQuestions = await startQuiz({ courseId, quizId }, `acc2${id}`);
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
                ],
            },
            `acc2${id}`,
        );
        const newClose = new Date(Date.now() - oneDay / 2).toString();
        await updateQuiz({ quizId, close: newClose }, `acc1${id}`);

        // Grade quiz
        const submissions = await getSubmissions({ courseId, quizId }, `acc1${id}`);

        await gradeQuestion(
            {
                questionId: quizQuestions.questions[1]._id,
                responseId: submissions[0].responses[0].responseId,
                mark: 1,
            },
            `acc1${id}`,
        );

        // Create assignments
        assignmentId1 = await createAssignment(
            {
                courseId,
                title: "Test assignment",
                description: "This is the description",
                deadline: close,
                marksAvailable: 2,
                tags: ["tag1", "tag2", "tag4"],
            },
            `acc1${id}`,
        );

        assignmentId2 = await createAssignment(
            {
                courseId,
                title: "Test assignment 2",
                description: "This is the description",
                deadline: close,
                marksAvailable: 3,
                tags: ["tag1", "tag2"],
            },
            `acc1${id}`,
        );

        // Submit assignment
        const submission = await submitAssignment(
            { courseId, assignmentId: assignmentId1, title: "test title" },
            `acc2${id}`,
            {
                fileRef: { name: "TestFile.PNG" },
                mimetype: "image/png",
            },
        );

        // Grade assignment
        await gradeAssignment(
            {
                submissionId: submission.submissionId,
                assignmentId: assignmentId1,
                mark: 1.75,
                comment: "test comment",
                successTags: ["tag1", "tag2"],
                improvementTags: ["tag4"],
            },
            `acc1${id}`,
        );

        await submitAssignment(
            { courseId, assignmentId: assignmentId2, title: "test title" },
            `acc2${id}`,
            {
                fileRef: { name: "TestFile.PNG" },
                mimetype: "image/png",
            },
        );
    });

    it("Should get all the student's grades in the course", async () => {
        const grades = await getGrades({ courseId }, `acc2${id}`);

        expect(grades).toEqual({
            assignmentGrades: [
                {
                    assignmentId: assignmentId1,
                    title: "Test assignment",
                    maxMarks: 2,
                    marksAwarded: 1.75,
                    successTags: ["tag1", "tag2"],
                    imrpovementTags: ["tag4"],
                },
                {
                    assignmentId: assignmentId2,
                    title: "Test assignment 2",
                    maxMarks: 3,
                },
            ],
            quizGrades: [
                {
                    quizId,
                    title: "Test quiz",
                    maxMarks: 1,
                    marksAwarded: 0.75,
                    incorrectTags: ["tag2"],
                },
            ],
        });
    });

    afterAll(async () => {
        // Clean up
        await deleteAssignment({ courseId, assignmentId: assignmentId1 }, `acc1${id}`);
        await deleteAssignment({ courseId, assignmentId: assignmentId2 }, `acc1${id}`);
        await deleteQuiz({ courseId, quizId }, `acc1${id}`);
        await User.deleteOne({ firebase_uid: `acc1${id}` }).exec();
        await Course.findByIdAndDelete(courseId).exec();
        await disconnect();
    });
});
