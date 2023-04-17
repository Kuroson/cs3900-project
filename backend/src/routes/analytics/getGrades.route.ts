import { Request, Response } from "express";
import { HttpException } from "@/exceptions/HttpException";
import { AssignmentInterface } from "@/models/course/assignment/assignment.model";
import { AssignmentSubmissionInterface } from "@/models/course/enrolment/assignmentSubmission.model";
import Enrolment, { EnrolmentInterface } from "@/models/course/enrolment/enrolment.model";
import { QuestionResponseInterface } from "@/models/course/enrolment/questionResponse.model";
import { QuizAttemptInterface } from "@/models/course/enrolment/quizAttempt.model";
import { QuestionInterface } from "@/models/course/quiz/question.model";
import { QuizInterface } from "@/models/course/quiz/quiz.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, getUserId, isValidBody } from "@/utils/util";

type AssignmentGrade = {
    assignmentId: string;
    title: string;
    maxMarks: number;
    marksAwarded?: number;
    successTags?: Array<string>;
    imrpovementTags?: Array<string>;
};

type QuizGrade = {
    quizId: string;
    title: string;
    maxMarks: number;
    marksAwarded?: number;
    incorrectTags?: Array<string>;
};

type ResponsePayload = {
    assignmentGrades: Array<AssignmentGrade>;
    quizGrades: Array<QuizGrade>;
};

type QueryPayload = {
    courseId: string;
};

/**
 * GET /analytics/grades
 * Get the course grades for the current student
 * @param req
 * @param res
 * @returns
 */
export const getGradesController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["courseId"];

        if (isValidBody<QueryPayload>(req.query, KEYS_TO_CHECK)) {
            const ret_data = await getGrades(req.query, authUser.uid);

            return res.status(200).json(ret_data);
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
 * Gets all the grades a student has been awarded in the course for all assessments (quizzes and assignments)
 *
 * @param queryBody Arguments containing the fields defined above in QueryPayload
 * @param firebase_uid Unique identifier of user
 * @throws { HttpException } Recall failed
 * @returns Object of grade information based on ResponsePayload above
 */
export const getGrades = async (
    queryBody: QueryPayload,
    firebase_uid: string,
    adminCheck = false,
) => {
    const { courseId } = queryBody;

    type assignmentEnrolmentType =
        | (Omit<Omit<EnrolmentInterface, "quizAttempts">, "assignmentSubmissions"> & {
              quizAttempts: Array<
                  Omit<Omit<QuizAttemptInterface, "quiz">, "responses"> & {
                      quiz: QuizInterface;
                      responses: Array<
                          Omit<QuestionResponseInterface, "question"> & {
                              question: QuestionInterface;
                          }
                      >;
                  }
              >;
              assignmentSubmissions: Array<
                  Omit<AssignmentSubmissionInterface, "assignment"> & {
                      assignment: AssignmentInterface;
                  }
              >;
          })
        | null;

    const enrolment: assignmentEnrolmentType = await Enrolment.findOne({
        student: await getUserId(firebase_uid),
        course: courseId,
    })
        .populate([
            {
                path: "quizAttempts",
                model: "QuizAttempt",
                populate: [
                    {
                        path: "quiz",
                        model: "Quiz",
                    },
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
            {
                path: "assignmentSubmissions",
                model: "AssignmentSubmission",
                populate: {
                    path: "assignment",
                    model: "Assignment",
                },
            },
        ])
        .catch((err) => {
            logger.error(err);
            return null;
        });
    if (enrolment === null) {
        throw new HttpException(400, "Failed to fetch enrolment");
    }

    const retData: ResponsePayload = {
        assignmentGrades: [],
        quizGrades: [],
    };

    for (const quizAttempt of enrolment.quizAttempts) {
        // Check if all questions marked
        const incorrectTags: Array<string> = [];
        let marksAwarded = 0;
        let marksTotal = 0;
        const allAnswered = quizAttempt.responses.every((questionResponse) => {
            marksAwarded += questionResponse.mark;
            marksTotal += questionResponse.question.marks;
            if (
                questionResponse.marked &&
                questionResponse.mark !== questionResponse.question.marks
            ) {
                incorrectTags.push(questionResponse.question.tag);
            }
            return questionResponse.marked;
        });

        const quizGrade: QuizGrade = {
            quizId: quizAttempt.quiz._id,
            title: quizAttempt.quiz.title,
            maxMarks: quizAttempt.quiz.maxMarks,
        };

        const closed = new Date() >= new Date(Date.parse(quizAttempt.quiz.close));
        if (allAnswered && (adminCheck || closed)) {
            quizGrade.marksAwarded = (marksAwarded / marksTotal) * quizAttempt.quiz.maxMarks;
            quizGrade.incorrectTags = incorrectTags;
        }

        retData.quizGrades.push(quizGrade);
    }

    for (const assignmentSubmission of enrolment.assignmentSubmissions) {
        const assignmentGrade: AssignmentGrade = {
            assignmentId: assignmentSubmission.assignment._id,
            title: assignmentSubmission.assignment.title,
            maxMarks: assignmentSubmission.assignment.marksAvailable,
        };

        if (assignmentSubmission.mark !== undefined) {
            assignmentGrade.marksAwarded = assignmentSubmission.mark;
            assignmentGrade.successTags = assignmentSubmission.successfulTags;
            assignmentGrade.imrpovementTags = assignmentSubmission.improvementTags;
        }

        retData.assignmentGrades.push(assignmentGrade);
    }

    return retData;
};
