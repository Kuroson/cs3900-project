import { startupTime } from "@/app";
import { HttpException } from "@/exceptions/HttpException";
import User from "@/models/user.model";
import { app } from "@/utils/firebase";
import { Request, Response } from "express";
import { getAuth } from "firebase-admin/auth";

/**`
 * GET /
 * Home page.
 */
export const indexController = async (req: Request, res: Response): Promise<void> => {
    res.json({ message: `Server is Live! ${startupTime.toISOString()}` });
};
