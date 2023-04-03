import { MessageInterface } from "models/message.model";
import { OnlineClassFull } from "models/onlineClass.model";
import { BackendLinkType, apiGet, apiPost, apiPut } from "./api";
import { getBackendLink } from "./userApi";

type CreateOnlineClassPayloadResponse = {
  classId: string;
};

export type CreateOnlineClassPayloadRequest = {
  courseId: string;
  title: string;
  description: string;
  startTime: number;
  linkToClass: string;
};

/**
 * Creates an online class
 * @param token
 * @param data
 * @param type
 * @returns
 */
export const createOnlineClass = (
  token: string | null,
  data: CreateOnlineClassPayloadRequest,
  type: BackendLinkType,
) => {
  return apiPost<CreateOnlineClassPayloadRequest, CreateOnlineClassPayloadResponse>(
    `${getBackendLink(type)}/class/schedule`,
    token,
    data,
  );
};

type StartOnlineClassPayloadResponse = {
  message: string;
};

type StartOnlineClassPayloadRequest = {
  classId: string;
};

/**
 * Sends a request to start the online class
 * @param token
 * @param classId id of class to start
 * @param type
 * @returns
 */
export const startOnlineClass = (token: string | null, classId: string, type: BackendLinkType) => {
  return apiPut<StartOnlineClassPayloadRequest, StartOnlineClassPayloadResponse>(
    `${getBackendLink(type)}/class/start`,
    token,
    { classId },
  );
};

type EndOnlineClassPayloadResponse = StartOnlineClassPayloadResponse;
type EndOnlineClassPayloadRequest = StartOnlineClassPayloadRequest;

export const endOnlineClass = (token: string | null, classId: string, type: BackendLinkType) => {
  return apiPut<EndOnlineClassPayloadRequest, EndOnlineClassPayloadResponse>(
    `${getBackendLink(type)}/class/end`,
    token,
    { classId },
  );
};

type UpdateOnlineClassPayloadResponse = {
  classId: string;
};

export type UpdateOnlineClassPayloadRequest = {
  classId: string;
  title: string;
  description: string;
  startTime: number;
  linkToClass: string;
};

export const updateOnlineClass = (
  token: string | null,
  data: UpdateOnlineClassPayloadRequest,
  type: BackendLinkType,
) => {
  return apiPut<UpdateOnlineClassPayloadRequest, UpdateOnlineClassPayloadResponse>(
    `${getBackendLink(type)}/class/update`,
    token,
    data,
  );
};

type GetOnlineClassDetailsPayloadResponse = OnlineClassFull;

type GetOnlineClassDetailsPayloadRequest = {
  classId: string;
};

export const getOnlineClassDetails = (
  token: string | null,
  classId: string,
  type: BackendLinkType,
) => {
  return apiGet<GetOnlineClassDetailsPayloadRequest, GetOnlineClassDetailsPayloadResponse>(
    `${getBackendLink(type)}/class`,
    token,
    { classId },
  );
};

type SendOnlineClassMessagePayloadResponse = {
  messageId: string;
  chatMessages: MessageInterface[];
};

type SendOnlineClassMessagePayloadRequest = {
  classId: string;
  message: string;
};

export const sendOnlineClassMessage = (
  token: string | null,
  classId: string,
  message: string,
  type: BackendLinkType,
) => {
  return apiPost<SendOnlineClassMessagePayloadRequest, SendOnlineClassMessagePayloadResponse>(
    `${getBackendLink(type)}/class/chat/send`,
    token,
    { classId, message },
  );
};
