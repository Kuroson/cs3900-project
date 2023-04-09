import { FullWeekInterface } from "models/week.model";
import { FullWorkloadInfo, WorkloadInterface } from "models/workload.model";
import { BackendLinkType, apiDelete, apiGet, apiPost, apiPut } from "./api";
import { getBackendLink } from "./userApi";

/**
 * POST requests
 */

type CreateNewWeekPayloadRequest = {
  courseId: string;
  pageId: string;
  title: string;
  description: string;
  deadline: string;
};

type CreateNewWeekPayloadResponse = {
  weekId: string;
};

export const createNewWeek = (
  token: string | null,
  courseId: string,
  pageId: string,
  title: string,
  description: string,
  deadline: string,
  type: BackendLinkType,
) => {
  return apiPost<CreateNewWeekPayloadRequest, CreateNewWeekPayloadResponse>(
    `${getBackendLink(type)}/workload/week/create`,
    token,
    {
      courseId: courseId,
      pageId: pageId,
      title: title,
      description: description,
      deadline: deadline,
    },
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
  return apiGet<{ courseId: string; weekId: string }, FullWeekInterface>(
    `${getBackendLink(type)}/workload/week`,
    token,
    ids,
  );
};

type GetWorkloadPayloadResponse = {
  courseId: string;
  workload: FullWorkloadInfo;
};

type GetWorkloadPayloadRequest = {
  courseId: string;
};

export const getWorkload = (token: string | null, courseId: string, type: BackendLinkType) => {
  return apiGet<GetWorkloadPayloadRequest, GetWorkloadPayloadResponse>(
    `${getBackendLink(type)}/workload`,
    token,
    { courseId },
  );
};

export type UpdateWeekPayloadRequest = {
  weekId: string;
  title?: string;
  description?: string;
  deadline?: string;
};

type UpdateWeekPayloadResponse = {
  weekId: string;
};

export const updateWeek = (
  token: string | null,
  payload: UpdateWeekPayloadRequest,
  type: BackendLinkType,
) => {
  return apiPut<UpdateWeekPayloadRequest, UpdateWeekPayloadResponse>(
    `${getBackendLink(type)}/workload/week/update`,
    token,
    payload,
  );
};

export type UpdateTaskPayloadRequest = {
  taskId: string;
  title?: string;
  description?: string;
};

type UpdateTaskPayloadResponse = {
  taskId: string;
};

export const updateTask = (
  token: string | null,
  payload: UpdateTaskPayloadRequest,
  type: BackendLinkType,
) => {
  return apiPut<UpdateTaskPayloadRequest, UpdateTaskPayloadResponse>(
    `${getBackendLink(type)}/workload/task/update`,
    token,
    payload,
  );
};

export type DeleteWeekPayloadRequest = {
  courseId: string;
  weekId: string;
};

type DeleteWeekPayloadResponse = Record<string, never>;

export const deleteWeek = (
  token: string | null,
  payload: DeleteWeekPayloadRequest,
  type: BackendLinkType,
) => {
  return apiDelete<DeleteWeekPayloadRequest, DeleteWeekPayloadResponse>(
    `${getBackendLink(type)}/workload/week/delete`,
    token,
    payload,
  );
};

export type DeleteTaskPayloadRequest = {
  weekId: string;
  taskId: string;
};

type DeleteTaskPayloadRespose = Record<string, never>;

export const deleteTask = (
  token: string | null,
  payload: DeleteTaskPayloadRequest,
  type: BackendLinkType,
) => {
  return apiDelete<DeleteTaskPayloadRequest, DeleteTaskPayloadRespose>(
    `${getBackendLink(type)}/workload/task/delete`,
    token,
    payload,
  );
};
