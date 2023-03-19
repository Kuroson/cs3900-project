import { BackendLinkType, apiGet } from "./api";
import { getBackendLink } from "./userApi";

type FileDownloadLinkPayloadRequest = {
  resourceId: string;
};

type FileDownloadLinkPayloadResponse = {
  linkToFile: string;
  fileType: string;
};

export const getFileDownloadLink = (
  token: string | null,
  resourceId: string,
  type: BackendLinkType,
) => {
  return apiGet<FileDownloadLinkPayloadRequest, FileDownloadLinkPayloadResponse>(
    `${getBackendLink(type)}/file`,
    token,
    { resourceId: resourceId },
  );
};
