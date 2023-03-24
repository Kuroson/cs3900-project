import { CreateQuizType } from "models/quiz.model";
import { BackendLinkType, apiPost } from "./api";
import { getBackendLink } from "./userApi";

export const createNewQuiz = (
  token: string | null,
  quiz: CreateQuizType,
  type: BackendLinkType,
) => {
  return apiPost<CreateQuizType, { quizId: string }>(
    `${getBackendLink(type)}/page/create`,
    token,
    quiz,
  );
};
