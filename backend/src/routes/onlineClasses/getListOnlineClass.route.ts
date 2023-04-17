import { Request, Response } from "express";
import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course/course.model";
import { OnlineClassInterface } from "@/models/course/onlineClass/onlineClass.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";

type BasicOnlineClassInformation = Omit<OnlineClassInterface, "chatMessage">;

type ResponsePayload = {
    classes: BasicOnlineClassInformation[];
};

type QueryPayload = {
    courseId: string;
};

/**
 * GET /class/list
 * Get all classes for a course
 * @param req
 * @param res
 */
export const getListOnlineClassController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["courseId"];

        if (isValidBody<QueryPayload>(req.query, KEYS_TO_CHECK)) {
            const { courseId } = req.query;
            const classData = await getClassList(courseId);
            return res.status(200).json({ classes: classData });
        } else {
            throw new HttpException(
                400,
                `Missing body keys: ${getMissingBodyIDs<QueryPayload>(req.query, KEYS_TO_CHECK)}`,
            );
        }
    } catch (error) {
        if (error instanceof HttpException) {
            logger.error(error.getMessage());
            logger.error(error.originalError);
            return res.status(error.getStatusCode()).json({ message: error.getMessage() });
        } else {
            logger.error(error);
            return res.status(500).json({ message: "Internal server error. Error was not caught" });
        }
    }
};

/**
 * Gets a list of online classes associated with a course
 * @param courseId id to query
 * @throws { HttpException } if courseId is not found
 * @returns
 */
export const getClassList = async (courseId: string): Promise<BasicOnlineClassInformation[]> => {
    // Find course
    const course = await Course.findById(courseId, "_id onlineClasses")
        .populate("onlineClasses", "_id title description running startTime linkToClass")
        .exec()
        .catch(() => null);

    if (course === null) throw new HttpException(400, `Course with id ${courseId} not found`);
    return course.onlineClasses;
};
