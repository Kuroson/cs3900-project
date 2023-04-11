import { BackendLinkType, apiGet } from "./api";
import { getBackendLink } from "./userApi";

export type Avatar = {
  relativeURL: string;
  cost: number;
};

export type AvatarMap = {
  [key: string]: Avatar;
};

export type AvatarMapKeys =
  | "bandit"
  | "cuddles"
  | "felix"
  | "fluffy"
  | "milo"
  | "missKitty"
  | "missy"
  | "molly"
  | "nala"
  | "oliver"
  | "oscar"
  | "patches"
  | "precious"
  | "sammy"
  | "shadow"
  | "simon"
  | "snowball"
  | "spooky"
  | "willow";

type GetAvatarPayloadRequest = Record<string, never>;

type GetAvatarPayloadResponse = {
  avatarMap: AvatarMap;
};

export const getAvatars = (token: string | null, type: BackendLinkType) => {
  return apiGet<GetAvatarPayloadRequest, GetAvatarPayloadResponse>(
    `${getBackendLink(type)}/avatars`,
    token,
    {},
  );
};
