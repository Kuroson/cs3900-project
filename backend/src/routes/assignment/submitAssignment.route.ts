import { HttpException } from "@/exceptions/HttpException";
import Assignment from "@/models/course/assignment/assignment.model";
import AssignmentSubmission from "@/models/course/enrolment/assignmentSubmission.model";
import Enrolment from "@/models/course/enrolment/enrolment.model";
import User from "@/models/user.model";
import { checkAuth, recallFileUrl } from "@/utils/firebase";
import { logger } from "@/utils/logger";
import { ErrorResponsePayload, getMissingBodyIDs, getUserId, isValidBody } from "@/utils/util";
import { time } from "console";
import dayjs from "dayjs";
import { Request, Response } from "express";
import { getKudos } from "../course/getKudosValues.route";

type ResponsePayload = {
    submissionId: string;
    timeSubmitted: number;
    fileType: string;
    linkToSubmission: string; // i.e., download link
};

type QueryPayload = {
    courseId: string;
    assignmentId: string;
    title: string;
};

/**
 * POST /assignment/submit
 * Submit an assignment and upload file to firebase store
 * @param req
 * @param res
 * @returns
 */
export const submitAssignmentController = async (
    req: Request<QueryPayload>,
    res: Response<ResponsePayload | ErrorResponsePayload>,
) => {
    try {
        const authUser = await checkAuth(req);
        const KEYS_TO_CHECK: Array<keyof QueryPayload> = ["courseId", "assignmentId", "title"];
        if (isValidBody<QueryPayload>(req.body, KEYS_TO_CHECK)) {
            // Body has been verified
            const queryBody = req.body;

            const ret_data = await submitAssignment(queryBody, authUser.uid, req.file);

            return res.status(200).json(ret_data);
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
 * Submits assignment for a student in a course
 *
 * @param queryBody Arguments containing the fields defined above in QueryPayload
 * @param firebase_uid Unique identifier of user
 * @throws { HttpException } Save/recall error, not before deadline
 * @returns Ret data based on ResponsePayload above
 */
export const submitAssignment = async (
    queryBody: QueryPayload,
    firebase_uid: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    file: any,
) => {
    const { courseId, assignmentId, title } = queryBody;

    const enrolment = await Enrolment.findOne({
        student: await getUserId(firebase_uid),
        course: courseId,
    }).catch((err) => null);
    if (enrolment === null) {
        throw new HttpException(400, "Failed to recall enrolment");
    }

    // Fail if submission after due date
    const assignment = await Assignment.findById(assignmentId).catch((err) => null);
    if (assignment === null) {
        throw new HttpException(400, "Failed to recall assignment");
    }

    const deadline = new Date(Date.parse(assignment.deadline));
    const now = new Date();

    if (now > deadline) {
        throw new HttpException(400, "Assignment already closed");
    }
    const timeSubmitted = Date.now() / 1000;
    const submissionId = await new AssignmentSubmission({
        assignment: assignmentId,
        title,
        storedName: file.fileRef.name,
        fileType: file.mimetype,
        timeSubmitted: timeSubmitted,
    })
        .save()
        .then((res) => {
            return res._id;
        })
        .catch((err) => {
            logger.error(err);
            throw new HttpException(500, "Failed to save submission");
        });

    enrolment.assignmentSubmissions.push(submissionId);

    //Calculate kudos to be earned for submitting this assignment
    const courseKudos = await getKudos(courseId);
    const daysEarly =
        -(dayjs.unix(timeSubmitted).diff(dayjs(assignment.deadline)) / 1000) / 3600 / 24;
    let extraKudos = 0.1 * Math.floor(daysEarly);
    // caps off at 0.5
    if (extraKudos > 0.5) extraKudos = 0.5;

    //Add to enrolment for leaderboard updates
    enrolment.kudosEarned =
        enrolment.kudosEarned + (1 + extraKudos) * courseKudos.assignmentCompletion;

    await enrolment.save().catch((err) => {
        logger.error(err);
        throw new HttpException(500, "Failed to save updated enrolment");
    });

    //Get and save to student kudos for spending
    const myStudent = await User.findOne({ _id: enrolment.student })
        .select("_id kudos")
        .exec()
        .catch(() => null);

    if (myStudent === null)
        throw new HttpException(400, `Student of ${enrolment.student} does not exist`);
    myStudent.kudos = myStudent.kudos + (1 + extraKudos) * courseKudos.assignmentCompletion;

    await myStudent.save().catch((err) => {
        throw new HttpException(500, "Failed to add kudos to user", err);
    });

    return {
        submissionId,
        timeSubmitted,
        fileType: file.mimetype,
        linkToSubmission: await recallFileUrl(file.fileRef.name),
    };
};
