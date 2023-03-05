import { HttpException } from "@/exceptions/HttpException";
import { verifyIdToken } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";

export const createCourse = async (req: Request, res: Response) => {
    // Sends a post request to create a new Course
    // May or may not return anything
    return res.status(200).json({});
};

export const updateCourse = async (req: Request, res: Response) => {
    // PUT request to update the details on a Course
    // the details to be updated are inputed as a message body
    const coursecode = req.params.coursecode;
    console.log(coursecode);
    return res.status(200).json({ coursecode: coursecode });
};

export const getCourse = async (req: Request, res: Response) => {
    // Get request to get all the details on a Course
    // inputs course code to get the course details
    // Returns Not found if course does not exist
    const coursecode = req.params.coursecode;
    return res.status(200).json({ coursecode: coursecode });
};
