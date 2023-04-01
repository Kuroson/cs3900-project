import { AssignmentListType } from "models/assignment.model";
import {
  CreateQuizType,
  QuizBasicInfo,
  QuizInfoType,
  QuizListType,
  QuizQuestionType,
  SubmitQuizType,
} from "models/quiz.model";
import { BackendLinkType, apiDelete, apiGet, apiPost, apiPut } from "./api";
import { getBackendLink } from "./userApi";

export const getListOfAssignments = (
  token: string | null,
  courseId: string,
  type: BackendLinkType,
) => {
  return apiGet<{ courseId: string }, { assignments: AssignmentListType[] }>(
    `${getBackendLink(type)}/assignment/list`,
    token,
    { courseId: courseId },
  );
};

// for admin
export const createNewQuiz = (
  token: string | null,
  quiz: CreateQuizType,
  type: BackendLinkType,
) => {
  return apiPost<CreateQuizType, { quizId: string }>(
    `${getBackendLink(type)}/quiz/create`,
    token,
    quiz,
  );
};

export const getQuizInfoAdmin = (token: string | null, quizId: string, type: BackendLinkType) => {
  return apiGet<{ quizId: string }, QuizInfoType>(`${getBackendLink(type)}/quiz/questions`, token, {
    quizId: quizId,
  });
};

export const updateQuizAdmin = (
  token: string | null,
  newInfo: QuizBasicInfo & { quizId: string },
  type: BackendLinkType,
) => {
  return apiPut<QuizBasicInfo & { quizId: string }, { quizId: string }>(
    `${getBackendLink(type)}/quiz/update`,
    token,
    newInfo,
  );
};

export const createNewQuestion = (
  token: string | null,
  newQuestion: QuizQuestionType & { courseId: string; quizId: string },
  type: BackendLinkType,
) => {
  return apiPost<QuizQuestionType & { courseId: string; quizId: string }, { questionId: string }>(
    `${getBackendLink(type)}/quiz/question/create`,
    token,
    newQuestion,
  );
};

export const deleteQuestion = (
  token: string | null,
  ids: { quizId: string; questionId: string },
  type: BackendLinkType,
) => {
  return apiDelete<{ quizId: string; questionId: string }, { message: string }>(
    `${getBackendLink(type)}/quiz/question/delete`,
    token,
    ids,
  );
};

// for student
export const startQuizStudent = (
  token: string | null,
  ids: { quizId: string; courseId: string },
  type: BackendLinkType,
) => {
  return apiGet<{ courseId: string; quizId: string }, QuizInfoType>(
    `${getBackendLink(type)}/quiz/start`,
    token,
    ids,
  );
};

export const getQuizInfoAfterSubmit = (
  token: string | null,
  ids: { quizId: string; courseId: string },
  type: BackendLinkType,
) => {
  return apiGet<{ courseId: string; quizId: string }, QuizInfoType>(
    `${getBackendLink(type)}/quiz`,
    token,
    ids,
  );
};

export const submitQuiz = (token: string | null, body: SubmitQuizType, type: BackendLinkType) => {
  return apiPost<SubmitQuizType, { message: string }>(
    `${getBackendLink(type)}/quiz/finish`,
    token,
    body,
  );
};
