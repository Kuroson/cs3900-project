import { UserDetails } from "models/user.model";
import {
  BackendLinkType,
  CLIENT_BACKEND_URL,
  SSR_BACKEND_URL,
  apiGet,
  apiPost,
  apiPut,
} from "./api";

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

type AdminInstructorSetPayloadRequest = {
  /**
   * User email to promote or demote
   */
  userEmail: string;
  instructor: boolean;
};

type AdminInstructorSetPayloadResponse = {
  message: string;
};

/**
 * Set a user as an instructor or not
 * @param token
 * @param email
 * @param instructor true to promote as instructor, false to demote
 * @param type
 * @returns
 */
export const adminInstructorSet = (
  token: string | null,
  email: string,
  instructor: boolean,
  type: BackendLinkType,
) => {
  return apiPut<AdminInstructorSetPayloadRequest, AdminInstructorSetPayloadResponse>(
    `${getBackendLink(type)}/admin/instructor/set`,
    token,
    { userEmail: email, instructor },
  );
};
