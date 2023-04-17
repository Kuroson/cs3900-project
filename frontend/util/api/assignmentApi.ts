import { HttpException } from "util/HttpExceptions";
import {
  AssignmentInfoType,
  AssignmentListType,
  CreateAssignmentType,
  SubmitAssignmentResponseType,
  SubmitAssignmentType,
  getAllSubmissionsType,
  gradingType,
} from "models/assignment.model";
import { BackendLinkType, apiGet, apiPost, apiPut } from "./api";
import { getBackendLink } from "./userApi";

export const getListOfAssignments = (
  token: string | null,
  courseId: string,
  type: BackendLinkType,
) => {
  return apiGet<{ courseId: string }, { assignments: AssignmentListType[] }>(
    `${getBackendLink(type)}/assignment/list`,
    token,
    { courseId: courseId },
  );
};

export const getAssignmentInfo = (
  token: string | null,
  courseId: string,
  assignmentId: string,
  type: BackendLinkType,
) => {
  return apiGet<{ courseId: string; assignmentId: string }, AssignmentInfoType>(
    `${getBackendLink(type)}/assignment`,
    token,
    {
      courseId,
      assignmentId,
    },
  );
};

// for admin
export const createNewAssignment = (
  token: string | null,
  assignment: CreateAssignmentType,
  type: BackendLinkType,
) => {
  return apiPost<CreateAssignmentType, { assignmentId: string }>(
    `${getBackendLink(type)}/assignment/create`,
    token,
    assignment,
  );
};

export const updateAssignmentAdmin = (
  token: string | null,
  newInfo: Omit<AssignmentInfoType, "submission"> & { courseId: string; assignmentId: string },
  type: BackendLinkType,
) => {
  return apiPut<
    AssignmentInfoType & { courseId: string; assignmentId: string },
    { assignmentId: string }
  >(`${getBackendLink(type)}/assignment/update`, token, newInfo);
};

// for student
export const submitAssignment = async (
  token: string | null,
  file: File,
  assignment: SubmitAssignmentType,
  type: BackendLinkType,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<[SubmitAssignmentResponseType | null, null | Error | any]> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    for (const [key, value] of Object.entries(assignment)) {
      formData.append(key, value);
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
    console.error("Error with posting to upload");
    return [null, err];
  }
};

export const getSubmissionsAss = (
  token: string | null,
  courseId: string,
  assignmentId: string,
  type: BackendLinkType,
) => {
  return apiGet<{ courseId: string; assignmentId: string }, getAllSubmissionsType>(
    `${getBackendLink(type)}/assignment/submissions`,
    token,
    {
      courseId,
      assignmentId,
    },
  );
};

export const gradeSubmission = (
  token: string | null,
  grading: gradingType,
  type: BackendLinkType,
) => {
  return apiPost<gradingType, { message: string }>(
    `${getBackendLink(type)}/assignment/grade`,
    token,
    grading,
  );
};
