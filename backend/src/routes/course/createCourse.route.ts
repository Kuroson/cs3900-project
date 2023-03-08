import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course.model";
import { verifyIdToken } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";

export const createCourseController = async (req: Request, res: Response) => {
    // Sends a post request to create a new Course
    // May or may not return anything
    // const course = new Course({
    // })
    return res.status(200).json({});
};
