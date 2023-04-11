import { Document, Schema, Types, model } from "mongoose";
import { TaskInterface } from "../workloadOverview/Task.model";

/**
 * This is an assignment that is given to students as an assessment.
 */
export interface AssignmentInterface extends Document {
    title: string;
    description?: string;
    deadline: string;
    marksAvailable: number;
    tags: Types.Array<string>;
    task?: TaskInterface["_id"];
}

const assignmentSchema: Schema = new Schema<AssignmentInterface>({
    title: { type: String, required: true },
    description: { type: String },
    deadline: { type: String, required: true },
    marksAvailable: { type: Number, required: true },
    tags: [{ type: String, required: true }],
    task: { type: Schema.Types.ObjectId, ref: "Task" },
});

const Assignment = model<AssignmentInterface & Document>("Assignment", assignmentSchema);

export default Assignment;
