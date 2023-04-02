import {
    CreatePostType,
    BasicPostInfo,
  } from "models/post.model";
  import { BackendLinkType, apiDelete, apiGet, apiPost, apiPut } from "./api";
  import { getBackendLink } from "./userApi";
  

export const createNewPost = (
    token: string | null,
    post: CreatePostType,
    type: BackendLinkType,
  ) => {
    return apiPost<CreatePostType, { postId: string }>(
      `${getBackendLink(type)}/forum/post`,
      token,
      post,
    );
  };