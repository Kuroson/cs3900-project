import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course.model";
import User from "@/models/user.model";
import { verifyIdTokenValid } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { UserInfo } from "@/utils/util";
import { Request, Response } from "express";


type ResponsePayload = {
    code?: string,
    students?: Array<UserInfo>;
    message?: string;
};

type QueryPayload = {
    courseCode: string;
};

export const getStudentsController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload>,
) => {
    try {
        if (req.headers.authorization === undefined)
            throw new HttpException(405, "No authorization header found");

        // Verify token
        const token = req.headers.authorization.split(" ")[1];
        const authUser = await verifyIdTokenValid(token);

        // User has been verified
        // Get course id from url param
        const ret_data = await getStudents(req.params.courseCode);
        logger.info(ret_data);
        return res.status(200).json(ret_data);
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
 * Returns all the students in a given course
 *
 * @param courseId The ID of the course to be recalled
 * @returns All students for a given courseId
 */
export const getStudents = async (courseId: string) => {
    const myCourse = await Course.findById(courseId);

    if (myCourse === null) throw new HttpException(500, "Course does not exist");

    const students = Array<UserInfo>();

    // for (const student_id of myCourse.students) {
    //     const student = await User.findById(student_id)
    //     if (student === null) throw new HttpException(500, "Failed to retrieve student");
    // }

    // const courseInfo = {
    //     code: myCourse.code,
    //     title: myCourse.title,
    //     description: myCourse.description,
    //     session: myCourse.session,
    //     icon: myCourse.icon,
    //     pages: new Array<PageInfo>(),
    // };


    // // Get each page info
    // for (const page of myCourse.pages) {
    //     const myPage = await Page.findById(page);
    //     if (myPage === null) throw new HttpException(500, "Failed to retrieve page");

    //     courseInfo.pages.push({
    //         title: myPage.title,
    //         pageId: myPage._id,
    //     });
    // }

    return {
        code: courseId,
        students: students
    };
};
