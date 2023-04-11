import { Document, Schema, Types, model } from "mongoose";
import { AssignmentInterface } from "../assignment/assignment.model";
import { OnlineClassInterface } from "../onlineClass/onlineClass.model";
import { QuizInterface } from "../quiz/quiz.model";

/**
 * This is an individual task within a week for students to complete.
 */
export interface TaskInterface extends Document {
    title: string;
    description?: string;
    quiz?: QuizInterface["_id"];
    assignment?: AssignmentInterface["_id"];
    onlineClass?: OnlineClassInterface["_id"];
}

const taskSchema: Schema = new Schema<TaskInterface>({
    title: { type: String, required: true },
    description: { type: String },
    quiz: { type: Schema.Types.ObjectId, ref: "Quiz" },
    assignment: { type: Schema.Types.ObjectId, ref: "Assignment" },
    onlineClass: { type: Schema.Types.ObjectId, ref: "OnlineClass" },
});

const Task = model<TaskInterface & Document>("Task", taskSchema);

export default Task;
