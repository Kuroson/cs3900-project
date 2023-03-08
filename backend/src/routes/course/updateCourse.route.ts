import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course.model";
import { verifyIdToken } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";

export const updateCourseController = async (req: Request, res: Response) => {
    // PUT request to update the details on a Course
    // the details to be updated are inputed as a message body
    const coursecode = req.params.coursecode;
    console.log(coursecode);
    return res.status(200).json({ coursecode: coursecode });
};
