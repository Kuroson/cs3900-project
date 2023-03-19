import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course.model";
import User from "@/models/user.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { Request, Response } from "express";
import { checkAdmin } from "../admin/admin.route";

type ResponsePayload = {
    courseId: string;
};

type QueryPayload = {
    code: string;
    title: string;
    session: string;
    description: string;
    icon: string;
};

/**
 * GET /course/create
 * Creates a course in the database based on the body
 * @param req
 * @param res
 * @returns
 */
export const createCourseController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = [
            "code",
            "title",
            "session",
            "description",
            "icon",
        ];

        // User has been verified
        if (isValidBody<QueryPayload>(req.body, KEYS_TO_CHECK)) {
            // Body has been verified
            const queryBody = req.body;

            const courseId = await createCourse(queryBody, authUser.uid);

            logger.info(`courseId: ${courseId}`);
            return res.status(200).json({ courseId });
        } else {
            throw new HttpException(
                400,
                `Missing body keys: ${getMissingBodyIDs<QueryPayload>(req.body, KEYS_TO_CHECK)}`,
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
 * Creates a new course in the system containing the base information in queryBody
 * initialised with an empty array of pages
 * The creator is set to the user who sent the request
 *
 * @param queryBody Arguments containing the fields defined above in QueryPayload
 * @param firebase_uid Unique identifier of user
 * @throws { HttpException } Not an admin, or invalid user in database
 * @returns The ID of the course that has been created
 */
export const createCourse = async (queryBody: QueryPayload, firebase_uid: string) => {
    if (!(await checkAdmin(firebase_uid))) {
        throw new HttpException(401, "Must be an admin to get all courses");
    }

    const { code, title, session, description, icon } = queryBody;

    const admin = await User.findOne({ firebase_uid })
        .then((res) => {
            if (res === null) {
                throw new HttpException(500, "Invalid user in database");
            }
            return res;
        })
        .catch((err) => {
            throw new HttpException(500, "Invalid user in database");
        });

    const myCourse = new Course({
        title,
        code,
        description,
        session,
        icon,
        creator: admin._id,
    });

    const courseId = await myCourse
        .save()
        .then((res) => {
            return res._id;
        })
        .catch((err) => {
            throw new HttpException(500, "Failed to save new course", err);
        });

    if (courseId === null) {
        throw new HttpException(500, "Failed to create course");
    }

    admin.created_courses.push(courseId);

    await admin.save().catch((err) => {
        throw new HttpException(500, "Failed to save user", err);
    });

    return courseId;
};
