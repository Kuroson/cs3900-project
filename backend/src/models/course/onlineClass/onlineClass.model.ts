import { Document, Schema, Types, model } from "mongoose";
import { MessageInterface } from "./message.model";

/**
 * An online class that occurs within a course. The link to the class will
 * be to an external site where the online class will be hosted and can be
 * embedded.
 */
export interface OnlineClassInterface extends Document {
    title: string;
    description: string;
    /**
     * Unix time stamp of when the class starts
     */
    startTime: number;
    /**
     * YouTube URL
     */
    linkToClass: string;
    running: boolean;
    chatMessages: Types.DocumentArray<MessageInterface["_id"]>;
}

const onlineClassSchema: Schema = new Schema<OnlineClassInterface>({
    title: { type: String, required: true },
    description: { type: String },
    startTime: { type: Number, required: true },
    linkToClass: { type: String, required: true },
    running: { type: Boolean, required: true },
    chatMessages: [{ type: Schema.Types.ObjectId, ref: "Message", required: true }],
});

const OnlineClass = model<OnlineClassInterface & Document>("OnlineClass", onlineClassSchema);

export default OnlineClass;

export type FullOnlineClassInterface = Omit<OnlineClassInterface, "chatMessages"> & {
    chatMessages: MessageInterface[];
};
