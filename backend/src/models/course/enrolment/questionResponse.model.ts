import { Document, Schema, Types, model } from "mongoose";
import { ChoiceInterface } from "../quiz/choice.model";
import { QuestionInterface } from "../quiz/question.model";

/**
 * This is the answers that a student has given for a question within a quiz.
 * This will contain either a choice or an answer, depending on if it is multiple
 * choice or extended response respectively.
 */
export interface QuestionResponseInterface extends Document {
    question: QuestionInterface["_id"];
    choice?: ChoiceInterface["_id"];
    answer?: string;
    mark: number;
}

const questionResponseSchema: Schema = new Schema<QuestionResponseInterface>({
    question: { type: Schema.Types.ObjectId, ref: "Question", required: true },
    choice: { type: Schema.Types.ObjectId, ref: "Choice" },
    answer: { type: String },
    mark: { type: Number, required: true },
});

const QuestionResponse = model<QuestionResponseInterface & Document>(
    "QuestionResponse",
    questionResponseSchema,
);

export default QuestionResponse;
