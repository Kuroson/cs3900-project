import { CreatePostType } from "models/post.model";
import { BasicForumInfo, GetForumType } from "models/forum.model";
import { BackendLinkType, apiDelete, apiGet, apiPost, apiPut } from "./api";
import { getBackendLink } from "./userApi";
import { CreateResponseType } from "models/response.model";
  

export const createNewPost = (
    token: string | null,
    payload: CreatePostType,
    type: BackendLinkType,
  ) => {
  return apiPost<CreatePostType, { postId: string }>(
    `${getBackendLink(type)}/forum/post`,
    token,
    payload,
  );
};

export const getCourseForum = (
  token: string | null,
  courseId: string,
  type: BackendLinkType,
) => {
return apiGet<GetForumType, BasicForumInfo>(
  `${getBackendLink(type)}/forum`,
  token,
  { courseId: courseId },
);
};

export const createNewResponse = (
  token: string | null,
  payload: CreateResponseType,
  type: BackendLinkType,
) => {
return apiPost<CreateResponseType, { responseId: string }>(
  `${getBackendLink(type)}/forum/respond`,
  token,
  payload,
);
};

export const markCorrectResponse = (
  token: string | null,
  responseId: string,
  type: BackendLinkType,
) => {
return apiPost<{ responseId: string }, { responseId: string }>(
  `${getBackendLink(type)}/forum/post/correct`,
  token,
  { responseId: responseId },
);
};
