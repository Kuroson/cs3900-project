import { BackendLinkType, apiPost } from "./api";
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
