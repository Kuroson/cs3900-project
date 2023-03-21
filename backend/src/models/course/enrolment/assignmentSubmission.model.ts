import { Document, Schema, Types, model } from "mongoose";
import { AssignmentInterface } from "../assignment/assignment.model";

/**
 * This is the submission by a student for a given assignment
 */
export interface AssignmentSubmissionInterface extends Document {
    assignment: AssignmentInterface["_id"];
    title: string;
    storedName: string;
    mark?: number;
    comments?: string;
    successfulTags?: Types.Array<string>; // Should come from the list of tags stored in the course object
    improvementTags?: Types.Array<string>; // Should come from the list of tags stored in the course object
}

const assignmentSubmissionSchema: Schema = new Schema<AssignmentSubmissionInterface>({
    assignment: { type: Schema.Types.ObjectId, ref: "Assignment", required: true },
    title: { type: String, required: true },
    storedName: { type: String, required: true },
    mark: { type: Number },
    comments: { type: String },
    successfulTags: [{ type: String }],
    improvementTags: [{ type: String }],
});

const AssignmentSubmission = model<AssignmentSubmissionInterface & Document>(
    "AssignmentSubmission",
    assignmentSubmissionSchema,
);

export default AssignmentSubmission;
