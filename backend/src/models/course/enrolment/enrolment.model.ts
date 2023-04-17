import { Document, Schema, Types, model } from "mongoose";
import { UserInterface } from "@/models/user.model";
import { CourseInterface } from "../course.model";
import { QuizAttemptInterface } from "./quizAttempt.model";
import { AssignmentSubmissionInterface } from "./assignmentSubmission.model";
import { WorkloadCompletionInterface } from "./workloadCompletion.model";

/**
 * This is the enrolment of a student within a course. It contains all of
 * the student's information pertaining to this course, including their attempts
 * at quizzes, their submissions for assignments, and their checked off tasks
 * in the weekly workload overview.
 */
export interface EnrolmentInterface extends Document {
    student: UserInterface["_id"];
    course: CourseInterface["_id"];
    quizAttempts: Types.DocumentArray<QuizAttemptInterface["_id"]>;
    assignmentSubmissions: Types.DocumentArray<AssignmentSubmissionInterface["_id"]>;
    workloadCompletion: Types.DocumentArray<WorkloadCompletionInterface["_id"]>;
    kudosEarned: number;
}

const enrolmentSchema: Schema = new Schema<EnrolmentInterface>({
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    quizAttempts: [{ type: Schema.Types.ObjectId, ref: "QuizAttempt", required: true }],
    assignmentSubmissions: [
        { type: Schema.Types.ObjectId, ref: "AssignmentSubmission", required: true },
    ],
    workloadCompletion: [
        { type: Schema.Types.ObjectId, ref: "WorkloadCompletion", required: true },
    ],
    kudosEarned: { type: Number, default: 0, required: true },
});

const Enrolment = model<EnrolmentInterface & Document>("Enrolment", enrolmentSchema);

export default Enrolment;
