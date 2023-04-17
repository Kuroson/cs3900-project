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

type ResponsePayload = {
    successTags: Record<string, number>;
    improvementTags: Record<string, number>;
};

type QueryPayload = {
    courseId: string;
};

/**
 * GET /analytics/tags/summary
 * Get the tag summary for the current student
 * @param req
 * @param res
 * @returns
 */
export const getTagSummaryController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["courseId"];

        if (isValidBody<QueryPayload>(req.query, KEYS_TO_CHECK)) {
            const ret_data = await getTagSummary(req.query, authUser.uid);

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
 * Gets a summary of the successful and improvement tags for the given student. This comes from
 * questions they have got right and wrong in quizzes and their feedback from assignments
 *
 * @param queryBody Arguments containing the fields defined above in QueryPayload
 * @param firebase_uid Unique identifier of user
 * @throws { HttpException } Recall failed
 * @returns Object of tag information based on ResponsePayload above
 */
export const getTagSummary = async (queryBody: QueryPayload, firebase_uid: string) => {
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
        successTags: {},
        improvementTags: {},
    };

    for (const quizAttempt of enrolment.quizAttempts) {
        for (const questionResponse of quizAttempt.responses) {
            if (
                questionResponse.marked &&
                questionResponse.mark !== questionResponse.question.marks
            ) {
                // Incorrect response
                if (!(questionResponse.question.tag in retData.improvementTags)) {
                    retData.improvementTags[questionResponse.question.tag] = 0;
                }
                retData.improvementTags[questionResponse.question.tag] += 1;
            } else if (questionResponse.marked) {
                // Correct response
                if (!(questionResponse.question.tag in retData.successTags)) {
                    retData.successTags[questionResponse.question.tag] = 0;
                }
                retData.successTags[questionResponse.question.tag] += 1;
            }
        }
    }

    for (const assignmentSubmission of enrolment.assignmentSubmissions) {
        if (
            assignmentSubmission.mark !== undefined &&
            assignmentSubmission.successfulTags !== undefined &&
            assignmentSubmission.improvementTags !== undefined
        ) {
            // Has been marked
            for (const tag of assignmentSubmission.successfulTags) {
                if (!(tag in retData.successTags)) {
                    retData.successTags[tag] = 0;
                }
                retData.successTags[tag] += 1;
            }

            for (const tag of assignmentSubmission.improvementTags) {
                if (!(tag in retData.improvementTags)) {
                    retData.improvementTags[tag] = 0;
                }
                retData.improvementTags[tag] += 1;
            }
        }
    }

    return retData;
};
