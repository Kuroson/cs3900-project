import { HttpException } from "@/exceptions/HttpException";
import { AssignmentInterface } from "@/models/course/assignment/assignment.model";
import Course, { CourseInterface } from "@/models/course/course.model";
import { EnrolmentInterface } from "@/models/course/enrolment/enrolment.model";
import Question, { MULTIPLE_CHOICE } from "@/models/course/quiz/question.model";
import { QuizInterface } from "@/models/course/quiz/quiz.model";
import { UserInterface } from "@/models/user.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, getUserId, isValidBody } from "@/utils/util";
import { Request, Response } from "express";
import { getGrades } from "./getGrades.route";
import { getQuestionAnalytics } from "./getQuestionAnalytics.route";
import { getTagSummary } from "./getTagSummary.route";

type StudentInfo = {
    studentId: string;
    name: string;
};

type StudentGradesType = {
    student: StudentInfo;
    grades: Record<string, number>;
};

type QuizType = {
    quizId: string;
    title: string;
    maxMarks: number;
};

type AssignmentType = {
    assignmentId: string;
    title: string;
    maxMarks: number;
};

type GradeSummaryType = {
    studentGrades: Array<StudentGradesType>;
    quizzes: Record<string, QuizType>;
    assignments: Record<string, AssignmentType>;
};

type TagSummaryType = {
    successTags: Record<string, number>;
    improvementTags: Record<string, number>;
};

type ChoiceInfo = {
    choiceId: string;
    text: string;
    correct: boolean;
};

type QuestionInfo = {
    questionId: string;
    count: number;
    text: string;
    tag: string;
    type: string;
    marks: number;
    choices?: Array<ChoiceInfo>;
};

type ResponsePayload = {
    tags: TagSummaryType;
    grades: GradeSummaryType;
    questions: Record<string, QuestionInfo>;
};

type QueryPayload = {
    courseId: string;
};

/**
 * GET /analytics/summary
 * Get the summary of the course for the admin
 * @param req
 * @param res
 * @returns
 */
export const getSummaryController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["courseId"];

        if (isValidBody<QueryPayload>(req.query, KEYS_TO_CHECK)) {
            const ret_data = await getSummary(req.query, authUser.uid);

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
 * Gets a summary of the course progress for the admin, including most successful and in need of
 * improvement tags and a list of commonly incorrect questions
 *
 * @param queryBody Arguments containing the fields defined above in QueryPayload
 * @param firebase_uid Unique identifier of user
 * @throws { HttpException } Recall failed
 * @returns Object of summary information based on ResponsePayload above
 */
export const getSummary = async (queryBody: QueryPayload, firebase_uid: string) => {
    const { courseId } = queryBody;

    type CourseType = Omit<CourseInterface, "students" | "quizzes" | "assignments"> & {
        students: Array<
            Omit<EnrolmentInterface, "student"> & {
                student: UserInterface;
            }
        >;
        quizzes: Array<QuizInterface>;
        assignments: Array<AssignmentInterface>;
    };

    const course: CourseType | null = await Course.findById(courseId)
        .populate([
            {
                path: "students",
                model: "Enrolment",
                populate: {
                    path: "student",
                    model: "User",
                },
            },
            {
                path: "quizzes",
                model: "Quiz",
            },
            {
                path: "assignments",
                model: "Assignment",
            },
        ])
        .catch((err) => {
            logger.error(err);
            return null;
        });
    if (course === null) {
        throw new HttpException(400, "Failed to fetch course");
    }

    const retData: ResponsePayload = {
        tags: {
            successTags: {},
            improvementTags: {},
        },
        grades: {
            studentGrades: [],
            quizzes: {},
            assignments: {},
        },
        questions: {},
    };

    // For each student, get their tags and then add to global
    for (const student of course.students) {
        const studentTags = await getTagSummary(queryBody, student.student.firebase_uid);

        for (const [tag, count] of Object.entries(studentTags.successTags)) {
            if (!(tag in retData.tags.successTags)) {
                retData.tags.successTags[tag] = 0;
            }
            retData.tags.successTags[tag] += count;
        }

        for (const [tag, count] of Object.entries(studentTags.improvementTags)) {
            if (!(tag in retData.tags.improvementTags)) {
                retData.tags.improvementTags[tag] = 0;
            }
            retData.tags.improvementTags[tag] += count;
        }

        const studentGrades = await getGrades(queryBody, student.student.firebase_uid, true);
        const grades: Record<string, number> = {};

        for (const quiz of studentGrades.quizGrades) {
            if (quiz.marksAwarded !== undefined) {
                grades[quiz.quizId] = quiz.marksAwarded;
            }
        }

        for (const assignment of studentGrades.assignmentGrades) {
            if (assignment.marksAwarded !== undefined) {
                grades[assignment.assignmentId] = assignment.marksAwarded;
            }
        }

        retData.grades.studentGrades.push({
            student: {
                studentId: student.student._id,
                name: `${student.student.first_name} ${student.student.last_name}`,
            },
            grades,
        });

        const studentQuestions = await getQuestionAnalytics(
            queryBody,
            student.student.firebase_uid,
        );

        for (const question of studentQuestions.questions) {
            if (!(question._id in retData.questions)) {
                const questionInfo = await Question.findById(question._id)
                    .populate({ path: "choices", model: "Choice" })
                    .catch((err) => null);
                if (questionInfo === null) {
                    throw new HttpException(500, "Failed to recall question");
                }
                retData.questions[questionInfo._id] = {
                    questionId: questionInfo._id,
                    count: 0,
                    text: questionInfo.text,
                    tag: questionInfo.tag,
                    type: questionInfo.type,
                    marks: questionInfo.marks,
                };
                if (questionInfo.type === MULTIPLE_CHOICE) {
                    retData.questions[questionInfo._id].choices = [];
                    for (const choice of questionInfo.choices ?? []) {
                        retData.questions[questionInfo._id].choices?.push({
                            choiceId: choice._id,
                            text: choice.text,
                            correct: choice.correct,
                        });
                    }
                }
            }

            retData.questions[question._id].count += 1;
        }
    }

    // Fill in assignments and quizzes
    for (const quiz of course.quizzes) {
        retData.grades.quizzes[quiz._id] = {
            quizId: quiz._id,
            title: quiz.title,
            maxMarks: quiz.maxMarks,
        };
    }

    for (const assignment of course.assignments) {
        retData.grades.assignments[assignment._id] = {
            assignmentId: assignment._id,
            title: assignment.title,
            maxMarks: assignment.marksAvailable,
        };
    }

    return retData;
};
