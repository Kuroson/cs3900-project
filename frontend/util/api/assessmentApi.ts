/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpException } from "util/HttpExceptions";
import { BackendLinkType, apiDelete, apiPost, apiPut } from "./api";
import { getBackendLink } from "./userApi";

interface UploadFilePayloadRequest extends Record<string, string> {
  courseId: string;
  assignmentId: string;
  title: string;
}

export type UploadFilePayloadResponse = {
  success: boolean;
  file_type: string;
  download_link: string; // i.e., download link
};

export const uploadAssignmentFile = async (
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

    const res = await fetch(`${getBackendLink(type)}/assignment/submit`, {
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
