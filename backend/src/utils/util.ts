import { Request, Response } from "express";
import { HttpException } from "@/exceptions/HttpException";
import User from "@/models/user.model";
import { checkAdmin } from "@/routes/admin/admin.route";
import { checkAuth } from "./firebase";
import { logger } from "./logger";

/**
 * Checks if the body contains all the fields specified in `fields`
 * @param body request body
 * @param fields fields to check
 * @returns true if body contains all fields specified in `fields`
 */
export const isValidBody = <T extends Record<string, unknown>>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body: any,
    fields: Array<keyof T>,
): body is T => {
    if (fields.length !== 0 && Object.keys(body).length === 0) return false;
    return fields.every((key) => Object.keys(body).includes(key as string));
};

/**
 * Gets the missing `fields` in the `body` as a string delimited by ", "
 * @param body request body
 * @param fields fields to check
 * @returns string with fields delimited by ", "
 */
export const getMissingBodyIDs = <T extends Record<string, unknown>>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body: any,
    fields: Array<keyof T>,
): string => {
    return fields.filter((key) => !Object.keys(body).includes(key as string)).join(", ");
};

/**
 * Gets the _id of a given user from their firebase id
 * @param firebase_uid the unique firebase identifier of the user
 * @throws HttpException: failed to recall user
 * @returns the mongoDB id of the user
 */
export const getUserId = async (firebase_uid: string) => {
    const user = await User.findOne({ firebase_uid }).catch((err) => null);

    if (user === null) {
        throw new HttpException(400, "Failed to recall user");
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return user._id;
};

export type UserInfo = {
    email: string;
    first_name: string;
    last_name: string;
    role: number; // 0=instructor, 1=student
    enrolments: Array<string>;
    created_courses: Array<string>;
    avatar?: string;
};

export type Nullable<T> = { [K in keyof T]: T[K] | null };

export type ErrorResponsePayload = {
    message: string;
};

export const adminRoute = (
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    routeHandler: (req: Request<any>, res: Response<any>) => any,
): ((req: Request, res: Response) => Promise<void>) => {
    return async (req, res) => {
        try {
            const authUser = await checkAuth(req);
            if (!(await checkAdmin(authUser.uid))) {
                const adminFailed = async (req: Request, res: Response) => {
                    return res.status(403).json({ message: "Must be an admin to access route" });
                };
                return await adminFailed(req, res);
            }

            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return await routeHandler(req, res);
        } catch (error) {
            // Auth failed
            const authFailed = async (req: Request, res: Response, error) => {
                if (error instanceof HttpException) {
                    logger.error(error.getMessage());
                    logger.error(error.originalError);
                    return res.status(error.getStatusCode()).json({ message: error.getMessage() });
                } else {
                    logger.error(error);
                    return res
                        .status(500)
                        .json({ message: "Internal server error. Error was not caught" });
                }
            };
            return await authFailed(req, res, error);
        }
    };
};
