import { HttpException } from "@/exceptions/HttpException";
import Course, { CourseInterface } from "@/models/course/course.model";
import { EnrolmentInterface } from "@/models/course/enrolment/enrolment.model";
import { UserInterface } from "@/models/user.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, getUserId, isValidBody } from "@/utils/util";
import { Request, Response } from "express";
import { getTagSummary } from "./getTagSummary.route";

type TagSummaryType = {
    successTags: Record<string, number>;
    improvementTags: Record<string, number>;
};

type ResponsePayload = {
    tags: TagSummaryType;
};

type QueryPayload = {
    courseId: string;
};

/**
 * GET /analytics/summary
 * Get the summary of the course for the admin
 * @param req
 * @param res
 * @returns
 */
export const getSummaryController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["courseId"];

        if (isValidBody<QueryPayload>(req.query, KEYS_TO_CHECK)) {
            const ret_data = await getSummary(req.query, authUser.uid);

            return res.status(200).json(ret_data);
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
 * Gets a summary of the course progress for the admin, including most successful and in need of
 * improvement tags and a list of commonly incorrect questions
 *
 * @param queryBody Arguments containing the fields defined above in QueryPayload
 * @param firebase_uid Unique identifier of user
 * @throws { HttpException } Recall failed
 * @returns Object of summary information based on ResponsePayload above
 */
export const getSummary = async (queryBody: QueryPayload, firebase_uid: string) => {
    const { courseId } = queryBody;

    type CourseType = Omit<CourseInterface, "students"> & {
        students: Array<
            Omit<EnrolmentInterface, "student"> & {
                student: UserInterface;
            }
        >;
    };

    const course: CourseType | null = await Course.findById(courseId)
        .populate({
            path: "students",
            model: "Enrolment",
            populate: {
                path: "student",
                model: "User",
            },
        })
        .catch((err) => {
            logger.error(err);
            return null;
        });
    if (course === null) {
        throw new HttpException(400, "Failed to fetch course");
    }

    const retData: ResponsePayload = {
        tags: {
            successTags: {},
            improvementTags: {},
        },
    };

    // For each student, get their tags and then add to global
    for (const student of course.students) {
        const studentTags = await getTagSummary(queryBody, student.student.firebase_uid);

        for (const [tag, count] of Object.entries(studentTags.successTags)) {
            if (!(tag in retData.tags.successTags)) {
                retData.tags.successTags[tag] = 0;
            }
            retData.tags.successTags[tag] += count;
        }

        for (const [tag, count] of Object.entries(studentTags.improvementTags)) {
            if (!(tag in retData.tags.improvementTags)) {
                retData.tags.improvementTags[tag] = 0;
            }
            retData.tags.improvementTags[tag] += count;
        }
    }

    return retData;
};
