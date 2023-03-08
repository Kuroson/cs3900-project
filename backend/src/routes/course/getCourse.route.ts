import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course.model";
import { verifyIdToken } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";

export const getCourseController = async (req: Request, res: Response) => {
    // Get request to get all the details on a Course
    // inputs course code to get the course details
    // Returns Not found if course does not exist
    const coursecode = req.params.coursecode;
    return res.status(200).json({ coursecode: coursecode });
};
