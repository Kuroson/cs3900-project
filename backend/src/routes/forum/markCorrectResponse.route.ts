import { Request, Response } from "express";
import { HttpException } from "@/exceptions/HttpException";
import Enrolment from "@/models/course/enrolment/enrolment.model";
import ForumResponse from "@/models/course/forum/response.model";
import User from "@/models/user.model";
import { checkAuth } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, isValidBody } from "@/utils/util";
import { checkAdmin } from "../admin/admin.route";
import { getKudos } from "./../../routes/course/getKudosValues.route";

type ResponsePayload = {
    responseId: string;
};

type QueryPayload = {
    responseId: string;
    courseId: string;
};

/**
 * POST /forum/respond
 * Creates a post in the forum of a given course based on the body
 * @param req
 * @param res
 * @returns
 */
export const markCorrectResponseController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["responseId", "courseId"];

        // User has been verified
        if (isValidBody<QueryPayload>(req.body, KEYS_TO_CHECK)) {
            // Body has been verified

            if (!(await checkAdmin(authUser.uid))) {
                throw new HttpException(
                    401,
                    "User is not an admin. Cannot mark response as correct",
                );
            }
            const queryBody = req.body;

            const responseId = await markCorrectResponse(queryBody, authUser.uid);

            return res.status(200).json({ responseId });
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
 * Creates a new post in the system containing the base information in queryBody
 * The creator is set to the user who sent the request
 *
 * @param queryBody Arguments containing the fields defined above in QueryPayload
 * @param firebase_uid Unique identifier of user
 * @throws { HttpException } Invalid user in database
 * @returns The ID of the post that has been created
 */
export const markCorrectResponse = async (queryBody: QueryPayload, firebase_uid: string) => {
    const { responseId, courseId } = queryBody;

    const user = await User.findOne({ firebase_uid: firebase_uid }).catch(() => null);
    if (user === null) throw new HttpException(400, `User of ${firebase_uid} does not exist`);

    const myResponse = await ForumResponse.findById(responseId)
        .select("_id poster correct")
        .exec()
        .catch(() => null);

    if (myResponse === null)
        throw new HttpException(400, `Response of ${responseId} does not exist`);

    myResponse.correct = true;
    await myResponse.save().catch((err) => {
        throw new HttpException(500, "Failed to save correct state to response");
    });

    //Update kudos for user as they have answered correctly
    const courseKudos = await getKudos(courseId);
    const myStudent = await User.findOne({ _id: myResponse.poster })
        .select("_id first_name kudos")
        .exec()
        .catch(() => null);

    if (myStudent === null)
        throw new HttpException(400, `Student of ${myResponse.poster} does not exist`);
    myStudent.kudos = myStudent.kudos + courseKudos.forumPostCorrectAnswer; //myCourse.kudosValues.forumPostCreation;

    await myStudent.save().catch((err) => {
        throw new HttpException(500, "Failed to add kudos to user", err);
    });

    //Add kudos to enrolment object for dashboard updates
    const enrolment = await Enrolment.findOne({
        student: myStudent._id,
        course: courseId,
    }).catch((err) => null);
    if (enrolment === null) throw new HttpException(400, "Enrolment not found");
    enrolment.kudosEarned = enrolment.kudosEarned + courseKudos.forumPostCorrectAnswer;
    await enrolment.save().catch((err) => {
        throw new HttpException(500, "Failed to add kudos to enrolment", err);
    });

    return myResponse._id.toString() as string;
};
