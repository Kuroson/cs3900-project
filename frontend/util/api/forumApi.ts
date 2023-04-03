import { CreatePostType } from "models/post.model";
import { BasicForumInfo, GetForumType } from "models/forum.model";
import { BackendLinkType, apiDelete, apiGet, apiPost, apiPut } from "./api";
import { getBackendLink } from "./userApi";
  

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

