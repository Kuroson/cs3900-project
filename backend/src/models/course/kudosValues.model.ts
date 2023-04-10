import { Document, Schema, model } from "mongoose";

export type KudosValuesType = {
    /**
     * Completion of quizzes
     */
    quizCompletion: number;
    /**
     * Submission of assignments
     */
    assignmentCompletion: number;
    /**
     * Completion of individual weekly assigned task gives
     */
    weeklyTaskCompletion: number;
    /**
     * Making of forum posts
     */
    forumPostCreation: number;
    /**
     * Replying to/answering other students on the forum
     */
    forumPostAnswer: number;
    /**
     * Correctly answering a question on the forum (marked by the instructor)
     */
    forumPostCorrectAnswer: number;
    /**
     * Attendance of online classes
     */
    attendance: number;
};

export interface KudosValuesInterface extends KudosValuesType, Document {}

const kudosValuesSchema: Schema = new Schema<KudosValuesInterface>({
    quizCompletion: { type: Number, required: true, default: 100 },
    assignmentCompletion: { type: Number, required: true, default: 100 },
    weeklyTaskCompletion: { type: Number, required: true, default: 100 },
    forumPostCreation: { type: Number, required: true, default: 100 },
    forumPostAnswer: { type: Number, required: true, default: 100 },
    forumPostCorrectAnswer: { type: Number, required: true, default: 100 },
    attendance: { type: Number, required: true, default: 100 },
});

const KudosValues = model<KudosValuesInterface & Document>("KudosValues", kudosValuesSchema);

export default KudosValues;
