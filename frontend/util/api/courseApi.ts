import { CourseInterface } from "models";
import { UserCourseInformation } from "models/course.model";
import { BackendLinkType, apiGet, apiPost, apiPut } from "./api";
import { getBackendLink } from "./userApi";

type UserCourseDetailsPayloadRequest = {
  courseId: string;
};

type UserCourseDetailsPayloadResponse = UserCourseInformation;

export const getUserCourseDetails = (
  token: string | null,
  courseId: string,
  type: BackendLinkType,
) => {
  return apiGet<UserCourseDetailsPayloadRequest, UserCourseDetailsPayloadResponse>(
    `${getBackendLink(type)}/course`,
    token,
    { courseId: courseId },
  );
};

type CreateNewCoursePayloadRequest = {
  code: string;
  title: string;
  session: string;
  description: string;
  icon: string;
};

type CreateNewCoursePayloadResponse = {
  courseId: string;
};

export const createNewCourse = (
  token: string | null,
  payload: CreateNewCoursePayloadRequest,
  type: BackendLinkType,
) => {
  return apiPost<CreateNewCoursePayloadRequest, CreateNewCoursePayloadResponse>(
    `${getBackendLink(type)}/course/create`,
    token,
    payload,
  );
};

type AddStudentPayloadRequest = {
  courseId: string;
  studentEmails: Array<string>;
};

type AddStudentPayloadResponse = {
  invalidEmails: Array<string>;
};

export const addStudentToCourse = (
  token: string | null,
  courseId: string,
  email: string,
  type: BackendLinkType,
) => {
  return apiPut<AddStudentPayloadRequest, AddStudentPayloadResponse>(
    `${getBackendLink(type)}/course/students/add`,
    token,
    { studentEmails: [email], courseId: courseId },
  );
};

type RemoveStudentPayloadRequest = AddStudentPayloadRequest;
type RemoveStudentPayloadResponse = AddStudentPayloadResponse;

export const removeStudentFromCourse = (
  token: string | null,
  courseId: string,
  email: string,
  type: BackendLinkType,
) => {
  return apiPut<RemoveStudentPayloadRequest, RemoveStudentPayloadResponse>(
    `${getBackendLink(type)}/course/students/remove`,
    token,
    { studentEmails: [email], courseId: courseId },
  );
};
