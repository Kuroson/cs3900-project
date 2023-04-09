import { UserDetails } from "models/user.model";
import { BackendLinkType, CLIENT_BACKEND_URL, SSR_BACKEND_URL, apiGet, apiPost } from "./api";

type RegisterUserPayloadRequest = {
  firstName: string;
  lastName: string;
  email: string;
};

type RegisterUserPayloadResponse = {
  message: string;
};

type UserDetailsRequestPayload = {
  email: string;
};

type UserDetailsResponsePayload = {
  userDetails: UserDetails;
};

export type ScheduleItemType = {
  courseCode: string;
  courseTitle: string;
  type: string;
  title: string;
  deadline: string;
  deadlineTimestamp: number;
  start: string;
};

type UserScheduleResponsePayload = {
  deadlines: Array<ScheduleItemType>;
};

export const getBackendLink = (type: BackendLinkType) => {
  return type === "client" ? CLIENT_BACKEND_URL : SSR_BACKEND_URL;
};

/**
 * Register new user with payload
 * @precondition Must only be called on the client side
 * @param token JWT token from firebase
 * @param payload payload to register new user
 * @returns
 */
export const registerNewUser = (token: string, payload: RegisterUserPayloadRequest) => {
  return apiPost<RegisterUserPayloadRequest, RegisterUserPayloadResponse>(
    `${CLIENT_BACKEND_URL}/user/register`,
    token,
    payload,
  );
};

export const getUserDetails = (token: string | null, email: string, type: BackendLinkType) => {
  return apiGet<UserDetailsRequestPayload, UserDetailsResponsePayload>(
    `${getBackendLink(type)}/user/details`,
    token,
    { email: email },
  );
};

export const getUserSchedule = (token: string | null, type: BackendLinkType) => {
  return apiGet<Record<string, never>, UserScheduleResponsePayload>(
    `${getBackendLink(type)}/user/schedule`,
    token,
    {},
  );
};
