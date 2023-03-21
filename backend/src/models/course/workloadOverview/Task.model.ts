import { Document, Schema, Types, model } from "mongoose";

/**
 * This is an individual task within a week for students to complete.
 */
export interface TaskInterface extends Document {
    title: string;
    description?: string;
}

const taskSchema: Schema = new Schema<TaskInterface>({
    title: { type: String, required: true },
    description: { type: String },
});

const Task = model<TaskInterface & Document>("Task", taskSchema);

export default Task;
