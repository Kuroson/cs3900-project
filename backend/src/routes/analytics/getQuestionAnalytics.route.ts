import { Request, Response } from "express";
import { HttpException } from "@/exceptions/HttpException";
import Enrolment, { EnrolmentInterface } from "@/models/course/enrolment/enrolment.model";
import { QuestionResponseInterface } from "@/models/course/enrolment/questionResponse.model";
import { QuizAttemptInterface } from "@/models/course/enrolment/quizAttempt.model";
import { ChoiceInterface } from "@/models/course/quiz/choice.model";
import { MULTIPLE_CHOICE, QuestionInterface } from "@/models/course/quiz/question.model";
import { QuizInterface } from "@/models/course/quiz/quiz.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, getUserId, isValidBody } from "@/utils/util";

type ChoiceInfo = {
    _id: string;
    text: string;
    chosen: boolean;
    correct?: boolean;
};

type QuestionInfo = {
    _id: string;
    text: string;
    tag: string;
    type: string;
    markAwarded: number;
    marks: number;
    response?: string;
    choices?: Array<ChoiceInfo>;
};

type ResponsePayload = {
    questions: Array<QuestionInfo>;
};

type QueryPayload = {
    courseId: string;
};

/**
 * GET /analytics/questions
 * Get the incorrectly answered questions
 * @param req
 * @param res
 * @returns
 */
export const getQuestionAnalyticsController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["courseId"];

        if (isValidBody<QueryPayload>(req.query, KEYS_TO_CHECK)) {
            const ret_data = await getQuestionAnalytics(req.query, authUser.uid);

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
 * Gets all the incorrect questions for quizzes within the course
 *
 * @param queryBody Arguments containing the fields defined above in QueryPayload
 * @param firebase_uid Unique identifier of user
 * @throws { HttpException } Recall failed
 * @returns Object of question information based on ResponsePayload above
 */
export const getQuestionAnalytics = async (queryBody: QueryPayload, firebase_uid: string) => {
    const { courseId } = queryBody;

    type assignmentEnrolmentType =
        | (Omit<EnrolmentInterface, "quizAttempts"> & {
              quizAttempts: Array<
                  Omit<Omit<QuizAttemptInterface, "quiz">, "responses"> & {
                      quiz: QuizInterface;
                      responses: Array<
                          Omit<QuestionResponseInterface, "question"> & {
                              question: Omit<QuestionInterface, "choices"> & {
                                  choices: Array<ChoiceInterface>;
                              };
                          }
                      >;
                  }
              >;
          })
        | null;

    const enrolment: assignmentEnrolmentType = await Enrolment.findOne({
        student: await getUserId(firebase_uid),
        course: courseId,
    })
        .populate({
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
                        populate: {
                            path: "choices",
                            model: "Choice",
                        },
                    },
                },
            ],
        })
        .catch((err) => {
            logger.error(err);
            return null;
        });
    if (enrolment === null) {
        throw new HttpException(400, "Failed to fetch enrolment");
    }

    const retData: ResponsePayload = {
        questions: [],
    };

    for (const quizAttempt of enrolment.quizAttempts) {
        for (const questionResponse of quizAttempt.responses) {
            if (
                questionResponse.marked &&
                questionResponse.mark !== questionResponse.question.marks
            ) {
                // Incorrect response
                const questionInfo: QuestionInfo = {
                    _id: questionResponse.question._id,
                    text: questionResponse.question.text,
                    tag: questionResponse.question.tag,
                    type: questionResponse.question.type,
                    marks: questionResponse.question.marks,
                    markAwarded: questionResponse.mark,
                };

                if (questionResponse.question.type === MULTIPLE_CHOICE) {
                    questionInfo.choices = [];
                    for (const choice of questionResponse.question.choices) {
                        const choiceInfo: ChoiceInfo = {
                            _id: choice._id,
                            text: choice.text,
                            chosen: questionResponse.choices.includes(choice._id),
                        };
                        // Add correct if after close
                        if (new Date() > new Date(Date.parse(quizAttempt.quiz.close))) {
                            choiceInfo.correct = choice.correct;
                        }
                        questionInfo.choices.push(choiceInfo);
                    }
                } else {
                    questionInfo.response = questionResponse.answer;
                }

                retData.questions.push(questionInfo);
            }
        }
    }

    return retData;
};
