import { startupTime } from "@/app";
import { Request, Response } from "express";

/**`
 * GET /
 * Home page.
 */
export const indexController = async (req: Request, res: Response): Promise<void> => {
    res.json({ message: `Server is Live! ${startupTime.toISOString()}` });
};
