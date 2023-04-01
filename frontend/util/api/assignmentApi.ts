import {
  AssignmentInfoType,
  AssignmentListType,
  CreateAssignmentType,
} from "models/assignment.model";
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

export const getAssignmentInfo = (
  token: string | null,
  courseId: string,
  assignmentId: string,
  type: BackendLinkType,
) => {
  return apiGet<{ courseId: string; assignmentId: string }, AssignmentInfoType>(
    `${getBackendLink(type)}/assignment`,
    token,
    {
      courseId,
      assignmentId,
    },
  );
};

// for admin
export const createNewAssignment = (
  token: string | null,
  assignment: CreateAssignmentType,
  type: BackendLinkType,
) => {
  return apiPost<CreateAssignmentType, { assignmentId: string }>(
    `${getBackendLink(type)}/assignment/create`,
    token,
    assignment,
  );
};

// TODO
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

// for student
export const submitQuiz = (token: string | null, body: SubmitQuizType, type: BackendLinkType) => {
  return apiPost<SubmitQuizType, { message: string }>(
    `${getBackendLink(type)}/quiz/finish`,
    token,
    body,
  );
};
