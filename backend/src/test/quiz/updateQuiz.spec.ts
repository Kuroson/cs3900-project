import { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import Course from "@/models/course/course.model";
import Quiz from "@/models/course/quiz/quiz.model";
import User from "@/models/user.model";
import { createCourse } from "@/routes/course/createCourse.route";
import { createQuiz } from "@/routes/quiz/createQuiz.route";
import { deleteQuiz } from "@/routes/quiz/deleteQuiz.route";
import { updateQuiz } from "@/routes/quiz/updateQuiz.route";
import { registerUser } from "@/routes/user/register.route";
import initialiseMongoose from "../testUtil";

describe("Test updating a quiz", () => {
    const id = uuidv4();
    let courseId: string;

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
    });

    it("Should update supplied fields in quiz", async () => {
        let quizId = await createQuiz(
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

        quizId = await updateQuiz({ quizId, title: "new title" }, `acc${id}`);

        let myQuiz = await Quiz.findById(quizId);
        expect(myQuiz === null).toBe(false);
        expect(myQuiz?.title).toBe("new title");
        expect(myQuiz?.description).toBe("This is the description");
        expect(myQuiz?.maxMarks).toBe(1);
        expect(myQuiz?.open).toBe("2023-03-24T10:00:00+11:00");
        expect(myQuiz?.close).toBe("2023-03-24T11:00:00+11:00");
        expect(myQuiz?.questions.length).toBe(0);

        quizId = await updateQuiz({ quizId, maxMarks: 5 }, `acc${id}`);

        myQuiz = await Quiz.findById(quizId);
        expect(myQuiz === null).toBe(false);
        expect(myQuiz?.title).toBe("new title");
        expect(myQuiz?.description).toBe("This is the description");
        expect(myQuiz?.maxMarks).toBe(5);
        expect(myQuiz?.open).toBe("2023-03-24T10:00:00+11:00");
        expect(myQuiz?.close).toBe("2023-03-24T11:00:00+11:00");
        expect(myQuiz?.questions.length).toBe(0);

        // Delete the quiz
        await deleteQuiz({ courseId, quizId }, `acc${id}`);
    });

    afterAll(async () => {
        // Clean up
        await User.deleteOne({ firebase_uid: `acc1${id}` }).exec();
        await Course.findByIdAndDelete(courseId).exec();
        await disconnect();
    });
});
