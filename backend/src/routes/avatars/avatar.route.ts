import { Request, Response } from "express";
import { AvatarMap, avatarMap } from "@/utils/avatarMapper";

type ResponsePayload = {
    avatarMap: AvatarMap;
};

/**`
 * GET /avatars
 * Get all the avatars and their costs
 */
export const avatarController = async (req: Request, res: Response<ResponsePayload>) => {
    return res.status(200).json({ avatarMap: avatarMap });
};
