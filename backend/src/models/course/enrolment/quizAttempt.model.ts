import { Document, Schema, Types, model } from "mongoose";
import { QuizInterface } from "../quiz/quiz.model";
import { QuestionResponseInterface } from "./questionResponse.model";

/**
 * This is the attempt of a student for a given quiz within a course.
 */
export interface QuizAttemptInterface extends Document {
    quiz: QuizInterface["_id"];
    underway: boolean;
    mark?: number;
    responses: Types.DocumentArray<QuestionResponseInterface["_id"]>;
}

const quizAttemptSchema: Schema = new Schema<QuizAttemptInterface>({
    quiz: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
    underway: { type: Boolean, required: true },
    mark: { type: Number },
    responses: [{ type: Schema.Types.ObjectId, ref: "QuestionResponse", required: true }],
});

const QuizAttempt = model<QuizAttemptInterface & Document>("QuizAttempt", quizAttemptSchema);

export default QuizAttempt;
