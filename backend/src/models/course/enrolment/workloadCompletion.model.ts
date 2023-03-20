import { UserInterface } from "@/models/user.model";
import { Document, Schema, Types, model } from "mongoose";
import { TaskInterface } from "../workloadOverview/Task.model";
import { WeekInterface } from "../workloadOverview/week.model";

/**
 * This indicates for a given week, what tasks a student has marked
 * as completed.
 */
export interface WorkloadCompletionInterface extends Document {
    week: WeekInterface["_id"];
    completedTasks: Types.DocumentArray<TaskInterface["_id"]>;
}

const workloadCompletionSchema: Schema = new Schema<WorkloadCompletionInterface>({
    week: { type: Schema.Types.ObjectId, ref: "Week", required: true },
    completedTasks: [{ type: Schema.Types.ObjectId, ref: "Task", required: true }],
});

const WorkloadCompletion = model<WorkloadCompletionInterface & Document>(
    "WorkloadCompletion",
    workloadCompletionSchema,
);

export default WorkloadCompletion;
