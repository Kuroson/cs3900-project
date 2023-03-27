import { Document, Schema, Types, model } from "mongoose";
import { ChoiceInterface, ChoiceInterfaceStudent } from "./choice.model";

export type QUESTION_TYPES = "choice" | "open";
export const MULTIPLE_CHOICE: QUESTION_TYPES = "choice";
export const EXTENDED_RESPONSE: QUESTION_TYPES = "open";

/**
 * This is a single question within a quiz. The question can be one of two
 * types (extended response or multiple choice). If it is extended response,
 * the choices array should be left empty. The tags are the outcomes of this
 * given question.
 */
export interface QuestionInterface extends Document {
    text: string;
    type: QUESTION_TYPES;
    marks: number;
    choices: Types.DocumentArray<ChoiceInterface["_id"]>;
    tag: string; // Should come from the list of tags stored in the course object
}

const questionSchema: Schema = new Schema<QuestionInterface>({
    text: { type: String, required: true },
    type: { type: String, required: true },
    marks: { type: Number, required: true },
    choices: [{ type: Schema.Types.ObjectId, ref: "Choice", required: true }],
    tag: { type: String, required: true },
});

const Question = model<QuestionInterface & Document>("Question", questionSchema);

export default Question;

export type QuestionInterfaceFull = Omit<QuestionInterface, "choices"> & {
    // Omit the array of ids and replace them with the full objects
    choices: ChoiceInterface[];
};

export type QuestionInterfaceStudent = Omit<Omit<QuestionInterface, "choices">, "tag"> & {
    // Omit the array of ids and replace them with the full objects
    choices: ChoiceInterfaceStudent[];
};
