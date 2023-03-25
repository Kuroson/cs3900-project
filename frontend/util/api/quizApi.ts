import { CreateQuizType, QuizInfoTypeAdmin, QuizListType } from "models/quiz.model";
import { BackendLinkType, apiGet, apiPost } from "./api";
import { getBackendLink } from "./userApi";

export const getListOfQuizzes = (token: string | null, courseId: string, type: BackendLinkType) => {
  return apiGet<{ courseId: string }, { quizzes: QuizListType[] }>(
    `${getBackendLink(type)}/quiz/list`,
    token,
    { courseId: courseId },
  );
};

// for student
// export const getQuizInfoAfterSubmit = (token: string | null, courseId: string, quizId: string, type: BackendLinkType) => {
//   return apiGet<{ courseId: string, quizId: string }, { quizzes: QuizListType[] }>(
//     `${getBackendLink(type)}/quiz`,
//     token,
//     { courseId: courseId, quizId: quizId },
//   );
// };

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
  return apiGet<{ quizId: string }, QuizInfoTypeAdmin>(
    `${getBackendLink(type)}/quiz/questions`,
    token,
    { quizId: quizId },
  );
};
