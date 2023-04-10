import { BasicForumInfo, GetForumType } from "models/forum.model";
import { FullPostInfo } from "models/post.model";
import { FullResponseInfo } from "models/response.model";
import { BackendLinkType, apiGet, apiPost } from "./api";
import { getBackendLink } from "./userApi";

type CreateNewPostPayloadResponse = {
  postData: FullPostInfo;
};

export type CreateNewPostPayloadRequest = {
  courseId: string;
  title: string;
  question: string;
  poster: string;
  image?: string;
};

export const createNewPost = (
  token: string | null,
  payload: CreateNewPostPayloadRequest,
  type: BackendLinkType,
) => {
  return apiPost<CreateNewPostPayloadRequest, CreateNewPostPayloadResponse>(
    `${getBackendLink(type)}/forum/post`,
    token,
    payload,
  );
};

export const getCourseForum = (token: string | null, courseId: string, type: BackendLinkType) => {
  return apiGet<GetForumType, BasicForumInfo>(`${getBackendLink(type)}/forum`, token, {
    courseId: courseId,
  });
};

type CreateNewForumReplyPayloadResponse = {
  responseData: FullResponseInfo;
};

export type CreateNewForumReplyPayloadRequest = {
  postId: string;
  courseId: string;
  text: string;
};

export const createNewResponse = (
  token: string | null,
  payload: CreateNewForumReplyPayloadRequest,
  type: BackendLinkType,
) => {
  return apiPost<CreateNewForumReplyPayloadRequest, CreateNewForumReplyPayloadResponse>(
    `${getBackendLink(type)}/forum/respond`,
    token,
    payload,
  );
};

type MarkCorrectResponsePayloadResponse = {
  responseId: string;
};

export type MarkCorrectResponsePayloadRequest = {
  responseId: string;
  courseId: string;
};

export const markCorrectResponse = (
  token: string | null,
  payload: MarkCorrectResponsePayloadRequest,
  type: BackendLinkType,
) => {
  return apiPost<MarkCorrectResponsePayloadRequest, MarkCorrectResponsePayloadResponse>(
    `${getBackendLink(type)}/forum/post/correct`,
    token,
    payload,
  );
};
