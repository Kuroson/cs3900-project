import { Document, Schema, Types, model } from "mongoose";
import { TaskInterface } from "./Task.model";

/**
 * This outlines the outcomes for a given week within the course.
 */
export interface WeekInterface extends Document {
    title: string;
    description?: string;
    deadline: string;
    tasks: Types.DocumentArray<TaskInterface["_id"]>;
}

const weekSchema: Schema = new Schema<WeekInterface>({
    title: { type: String, required: true },
    description: { type: String },
    deadline: { type: String, required: true },
    tasks: [{ type: Schema.Types.ObjectId, ref: "Task", required: true }],
});

const Week = model<WeekInterface & Document>("Week", weekSchema);

export default Week;
