import { Document, Schema, model } from "mongoose";

/**
 * This is a choice that is available for a multiple choice quiz question.
 */
export interface ChoiceInterface extends Document {
    text: string;
    correct: boolean;
}

const choiceSchema: Schema = new Schema<ChoiceInterface>({
    text: { type: String, required: true },
    correct: { type: Boolean, required: true },
});

const Choice = model<ChoiceInterface & Document>("Choice", choiceSchema);

export default Choice;

export type ChoiceInterfaceStudent = Omit<ChoiceInterface, "correct">;
