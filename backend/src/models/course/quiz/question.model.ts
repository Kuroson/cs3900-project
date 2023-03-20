import { Document, Schema, Types, model } from "mongoose";
import { ChoiceInterface } from "./choice.model";

export const MULTIPLE_CHOICE = 0;
export const EXTENDED_REPONSE = 1;

/**
 * This is a single question within a quiz. The question can be one of two
 * types (extended response or multiple choice). If it is extended response,
 * the choices array should be left empty. The tags are the outcomes of this
 * given question.
 */
export interface QuestionInterface extends Document {
    text: string;
    type: number;
    marks: number;
    choices: Types.DocumentArray<ChoiceInterface["_id"]>;
    tags: Types.Array<string>; // Should come from the list of tags stored in the course object
}

const questionSchema: Schema = new Schema<QuestionInterface>({
    text: { type: String, required: true },
    type: { type: Number, required: true },
    marks: { type: Number, required: true },
    choices: [{ type: Schema.Types.ObjectId, ref: "Choice", required: true }],
    tags: [{ type: String, required: true }],
});

const Question = model<QuestionInterface & Document>("Question", questionSchema);

export default Question;

export const isMultipleChoice = (questionType: number) => {
    return questionType == 0;
};
