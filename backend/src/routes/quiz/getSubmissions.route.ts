import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course/course.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";
import { checkAdmin } from "../admin/admin.route";

type QuestionInfo = {
    questionId: string;
    text: string;
    marks: string;
    tag: string;
};

type ResponseInfo = {
    responseId: string;
    studentId: string;
    answer: string;
};

type QuestionsInfo = {
    question: QuestionInfo;
    responses: Array<ResponseInfo>;
};

type ResponsePayload = {
    submissions: Array<QuestionsInfo>;
};

type QueryPayload = {
    courseId: string;
    quizId: string;
};

/**
 * GET /quiz/submissions
 * Gets all unmarked quiz submissions
 * @param req
 * @param res
 * @returns
 */
export const getSubmissionsController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["courseId", "quizId"];

        // User has been verified
        if (isValidBody<QueryPayload>(req.query, KEYS_TO_CHECK)) {
            // Body has been verified
            const queryBody = req.query;

            const submissions = await getSubmissions(queryBody, authUser.uid);

            logger.info(`submissions: ${submissions}`);
            return res.status(200).json({ submissions });
        } else {
            throw new HttpException(
                400,
                `Missing body keys: ${getMissingBodyIDs<QueryPayload>(req.query, KEYS_TO_CHECK)}`,
            );
        }
    } catch (error) {
        if (error instanceof HttpException) {
            logger.error(error.getMessage());
            logger.error(error.originalError);
            return res.status(error.getStatusCode()).json({ message: error.getMessage() });
        } else {
            logger.error(error);
            return res.status(500).json({ message: "Internal server error. Error was not caught" });
        }
    }
};

/**
 * Gets all unmaked submissions for the given quiz
 *
 * @param queryBody Arguments containing the fields defined above in QueryPayload
 * @param firebase_uid Unique identifier of user
 * @throws { HttpException } Recall failure
 * @returns The list of questions each with their submissions
 */
export const getSubmissions = async (queryBody: QueryPayload, firebase_uid: string) => {
    if (!(await checkAdmin(firebase_uid))) {
        throw new HttpException(401, "Must be an admin to get submissions");
    }

    const { courseId, quizId } = queryBody;

    const course = await Course.findById(courseId)
        .populate({
            path: "students",
            model: "Enrolment",
            select: "_id quizAttempts student",
            populate: {
                path: "quizAttempts",
                model: "QuizAttempt",
                populate: [
                    {
                        path: "responses",
                        model: "QuestionResponse",
                        populate: {
                            path: "question",
                            model: "Question",
                        },
                    },
                ],
            },
        })
        .catch((err) => {
            logger.error(err);
            throw new HttpException(400, "Failed to fetch course and submission info");
        });
    if (course === null) {
        throw new HttpException(400, "Failed to fetch course and submission info");
    }

    const questions: Record<string, QuestionsInfo> = {};
    for (const student of course.students) {
        const currStudent = student.student;
        for (const attempt of student.quizAttempts) {
            if (!attempt.quiz.equals(quizId)) {
                continue;
            }
            // This is the quiz, now find any unmarked questions
            for (const response of attempt.responses) {
                if (response.marked) {
                    continue;
                }
                // Found an unmarked question (must be extended response)
                // Check if this quiz has been added to the output yet
                if (!(response.question._id.toString() in questions)) {
                    questions[response.question._id.toString()] = {
                        question: {
                            questionId: response.question._id.toString(),
                            text: response.question.text,
                            marks: response.question.marks,
                            tag: response.question.tag,
                        },
                        responses: [],
                    };

                    const responseInfo: ResponseInfo = {
                        responseId: response._id,
                        studentId: currStudent,
                        answer: response.answer,
                    };
                    questions[response.question._id.toString()].responses.push(responseInfo);
                }
            }
        }
    }

    // Form submissions
    const submissions: Array<QuestionsInfo> = new Array<QuestionsInfo>();
    for (const [key, value] of Object.entries(questions)) {
        submissions.push(value);
    }

    return submissions;
};
