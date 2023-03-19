/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpException } from "util/HttpExceptions";
import { BackendLinkType, apiDelete, apiPost, apiPut } from "./api";
import { getBackendLink } from "./userApi";

type CreateNewPagePayloadRequest = {
  courseId: string;
  title: string;
};

type CreateNewPagePayloadResponse = {
  pageId: string;
};

export const createNewPage = (
  token: string | null,
  courseId: string,
  title: string,
  type: BackendLinkType,
) => {
  return apiPost<CreateNewPagePayloadRequest, CreateNewPagePayloadResponse>(
    `${getBackendLink(type)}/page/create`,
    token,
    { courseId: courseId, title: title },
  );
};

type DeletePagePayloadRequest = {
  courseId: string;
  pageId: string;
};

type DeletePagePayloadResponse = {
  message: string;
};

export const deletePage = (
  token: string | null,
  courseId: string,
  pageId: string,
  type: BackendLinkType,
) => {
  return apiDelete<DeletePagePayloadRequest, DeletePagePayloadResponse>(
    `${getBackendLink(type)}/page`,
    token,
    { courseId: courseId, pageId: pageId },
  );
};

export type UpdatePagePayloadRequest = {
  courseId: string;
  pageId: string;
  title: string;
  sectionId: string | null;
  resourceId: string | null; // This value will exist if we are updating a resource
  description: string;
};

type UpdatePagePayloadResponse = {
  courseId: string;
};

export const updatePageResource = (
  token: string | null,
  payload: UpdatePagePayloadRequest,
  type: BackendLinkType,
) => {
  return apiPut<UpdatePagePayloadRequest, UpdatePagePayloadResponse>(
    `${getBackendLink(type)}/page/add/resource`,
    token,
    payload,
  );
};

interface UploadFilePayloadRequest extends Record<string, string> {
  resourceId: string;
}

export type UploadFilePayloadResponse = {
  success: boolean;
  file_type: string;
  download_link: string; // i.e., download link
};

export const uploadResourceFile = async (
  token: string | null,
  file: File,
  queryParams: UploadFilePayloadRequest,
  type: BackendLinkType,
): Promise<[UploadFilePayloadResponse | null, null | Error | any]> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    for (const key of Object.keys(queryParams)) {
      formData.append(key, queryParams[key]);
    }

    const res = await fetch(`${getBackendLink(type)}/file/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token ?? "bad"}`,
      },
      body: formData,
    });
    if (!res.ok) {
      const status = res.status;
      const data = await res.json();
      return [null, new HttpException(status, data.message)];
    }
    const data = await res.json();
    return [data, null];
  } catch (err) {
    console.error("Error with posting to example");
    return [null, err];
  }
};

type AddNewResourcePayloadRequest = {
  courseId: string;
  pageId: string;
  title: string;
  description: string;
  sectionId: string | null;
};

type AddNewResourcePayloadResponse = {
  resourceId: string;
};

export const addNewResource = (
  token: string | null,
  payload: AddNewResourcePayloadRequest,
  type: BackendLinkType,
) => {
  return apiPut<UpdatePagePayloadRequest, AddNewResourcePayloadResponse>(
    `${getBackendLink(type)}/page/add/resource`,
    token,
    { ...payload, resourceId: null },
  );
};

export type RemoveResourcePayloadRequest = {
  courseId: string;
  pageId: string;
  sectionId: string | null;
  resourceId: string;
};

type RemoveResourcePayloadResponse = {
  message: string;
};

export const removeResource = (
  token: string | null,
  payload: RemoveResourcePayloadRequest,
  type: BackendLinkType,
) => {
  return apiDelete<RemoveResourcePayloadRequest, RemoveResourcePayloadResponse>(
    `${getBackendLink(type)}/page/remove/resource`,
    token,
    payload,
  );
};

export type UpdateSectionPayloadRequest = {
  courseId: string;
  pageId: string;
  sectionId: string | null;
  title: string;
};

type UpdateSectionPayloadResponse = {
  sectionId: string;
};

export const updateSection = (
  token: string | null,
  payload: UpdateSectionPayloadRequest,
  type: BackendLinkType,
) => {
  return apiPut<UpdateSectionPayloadRequest, UpdateSectionPayloadResponse>(
    `${getBackendLink(type)}/page/add/section`,
    token,
    payload,
  );
};

export type AddSectionPayloadRequest = UpdateSectionPayloadRequest;
type AddSectionPayloadResponse = UpdateSectionPayloadResponse;

export const createSection = (
  token: string | null,
  payload: UpdateSectionPayloadRequest,
  type: BackendLinkType,
) => {
  return apiPut<AddSectionPayloadRequest, AddSectionPayloadResponse>(
    `${getBackendLink(type)}/page/add/section`,
    token,
    payload,
  );
};

export type DeleteSectionPayloadRequest = {
  courseId: string;
  pageId: string;
  sectionId: string;
};

type DeleteSectionPayloadResponse = {
  message: string;
};

export const deleteSection = (
  token: string | null,
  payload: DeleteSectionPayloadRequest,
  type: BackendLinkType,
) => {
  return apiDelete<DeleteSectionPayloadRequest, DeleteSectionPayloadResponse>(
    `${getBackendLink(type)}/page/removes/section`,
    token,
    payload,
  );
};
