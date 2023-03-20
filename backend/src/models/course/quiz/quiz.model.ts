import { Document, Schema, Types, model } from "mongoose";
import { QuestionInterface } from "./question.model";

/**
 * This is a quiz within the course that is set as an assessment.
 */
export interface QuizInterface extends Document {
    title: string;
    description: string;
    open: string; // Stringified datetime object
    close: string; // Stringified datetime object
    maxGrade: number;
    questions: Types.DocumentArray<QuestionInterface["_id"]>;
}

const quizSchema: Schema = new Schema<QuizInterface>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    open: { type: String, required: true },
    close: { type: String, required: true },
    maxGrade: { type: Number, required: true },
    questions: [{ type: Schema.Types.ObjectId, ref: "Choice", required: true }],
});

const Quiz = model<QuizInterface & Document>("Quiz", quizSchema);

export default Quiz;
