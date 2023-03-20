import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course/course.model";
import Page, { PageInterface } from "@/models/course/page/page.model";
import { ResourceInterface } from "@/models/course/page/resource.model";
import { SectionInterface } from "@/models/course/page/section.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";

export type PageData = Omit<PageInterface, "sections" | "resources"> & {
    sections: Array<
        Omit<SectionInterface, "resources"> & {
            resources: ResourceInterface[];
        }
    >;
    resources: ResourceInterface[];
};

type ResponsePayload = PageData & {
    courseId: string;
    pageId: string;
};

type QueryPayload = {
    courseId: string;
    pageId: string;
};

/**
 * GET /course/page
 * Get the all of the pages information for a specific courseId and pageId.
 * Returns resources
 * @param req
 * @param res
 * @returns
 */
export const getCoursePageController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["courseId", "pageId"];

        if (isValidBody<QueryPayload>(req.query, KEYS_TO_CHECK)) {
            const { pageId, courseId } = req.query;
            const data = await getPage(pageId, courseId);
            return res.status(200).json({
                courseId: courseId,
                pageId: pageId,
                ...data,
            });
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
 * Gets the state of a given page, returning its resources, sections and resources
 * nested within these sections. It gives base information for each and the link to
 * access download of any resource.
 *
 * @param pageId The ID of the page to get information for
 * @param courseId The course the page is located within
 * @throws { HttpException } if the pageId or courseId cannot be found or if pageId cannot be found inside courseId
 * @returns The state of the page in the format defined within ResponsePayload
 */
export const getPage = async (pageId: string, courseId: string): Promise<PageData> => {
    const myCourse = await Course.findById(courseId).catch(() => null);
    if (myCourse === null) throw new HttpException(500, `Failed to recall course of ${courseId}`);

    if (!myCourse.pages.includes(pageId))
        throw new HttpException(400, `Page ${pageId} is not in course ${courseId}`);

    const myPage = await Page.findById(pageId, "_id title sections resources")
        .populate("sections", "_id title resources")
        .populate({
            path: "sections",
            populate: { path: "resources", select: "_id title description file_type stored_name" },
            select: "_id title resources",
        })
        .populate("resources", "_id title description file_type stored_name")
        .exec()
        .catch(() => null);
    if (myPage === null) throw new HttpException(500, `Failed to recall page of ${pageId}`);

    // Force the type comparison
    return myPage as unknown as PageData;
};
