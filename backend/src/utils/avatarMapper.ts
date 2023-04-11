type Avatar = {
    relativeURL: string;
    cost: number;
};

export type AvatarMap = {
    [key: string]: Avatar;
};

const BASE = "public/avatars";

export const avatarMap: AvatarMap = {
    bandit: { relativeURL: `${BASE}/bandit.svg`, cost: 100 },
    cuddles: { relativeURL: `${BASE}/cuddles.svg`, cost: 100 },
    felix: { relativeURL: `${BASE}/felix.svg`, cost: 100 },
    fluffy: { relativeURL: `${BASE}/fluffy.svg`, cost: 100 },
    milo: { relativeURL: `${BASE}/milo.svg`, cost: 100 },
    missKitty: { relativeURL: `${BASE}/missKitty.svg`, cost: 100 },
    missy: { relativeURL: `${BASE}/missy.svg`, cost: 100 },
    molly: { relativeURL: `${BASE}/molly.svg`, cost: 100 },
    nala: { relativeURL: `${BASE}/nala.svg`, cost: 100 },
    oliver: { relativeURL: `${BASE}/oliver.svg`, cost: 100 },
    oscar: { relativeURL: `${BASE}/oscar.svg`, cost: 100 },
    patches: { relativeURL: `${BASE}/patches.svg`, cost: 100 },
    precious: { relativeURL: `${BASE}/precious.svg`, cost: 100 },
    sammy: { relativeURL: `${BASE}/sammy.svg`, cost: 100 },
    shadow: { relativeURL: `${BASE}/shadow.svg`, cost: 100 },
    simon: { relativeURL: `${BASE}/simon.svg`, cost: 100 },
    snowball: { relativeURL: `${BASE}/snowball.svg`, cost: 100 },
    spooky: { relativeURL: `${BASE}/spooky.svg`, cost: 100 },
    willow: { relativeURL: `${BASE}/willow.svg`, cost: 100 },
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
