import { BackendLinkType, apiGet, apiPost } from "./api";
import { getBackendLink } from "./userApi";

/**
 * POST requests
 */

type CreateNewWeekPayloadRequest = {
  courseId: string;
  title: string;
  description: string;
};

type CreateNewWeekPayloadResponse = {
  weekId: string;
};

export const createNewWeek = (
  token: string | null,
  courseId: string,
  title: string,
  description: string,
  type: BackendLinkType,
) => {
  return apiPost<CreateNewWeekPayloadRequest, CreateNewWeekPayloadResponse>(
    `${getBackendLink(type)}/workload/week/create`,
    token,
    { courseId: courseId, title: title, description: description },
  );
};

type CreateNewTaskPayloadRequest = {
  weekId: string;
  title: string;
  description: string;
};

type CreateNewTaskPayloadResponse = {
  taskId: string;
};

export const createNewTask = (
  token: string | null,
  weekId: string,
  title: string,
  description: string,
  type: BackendLinkType,
) => {
  return apiPost<CreateNewTaskPayloadRequest, CreateNewTaskPayloadResponse>(
    `${getBackendLink(type)}/workload/task/create`,
    token,
    { weekId: weekId, title: title, description: description },
  );
};

export const getWeek = (
  token: string | null,
  ids: { courseId: string; weekId: string },
  type: BackendLinkType,
) => {
  return apiGet<{ courseId: string; weekId: string }, QuizInfoType>(
    `${getBackendLink(type)}/quiz`,
    token,
    ids,
  );
};
