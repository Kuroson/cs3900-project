import { UserInterface } from "@/models/user.model";
import { Document, Schema, Types, model } from "mongoose";

/**
 * This is a single chat message sent within an online class.
 */
export interface MessageInterface extends Document {
    message: string;
    sender: UserInterface["_id"];
    /**
     * UNIX timestamp
     */
    timestamp: number;
    senderName: string;
}

const messageSchema: Schema = new Schema<MessageInterface>({
    message: { type: String, required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    timestamp: { type: Number, required: true },
    senderName: { type: String, required: true },
});

const Message = model<MessageInterface & Document>("Message", messageSchema);

export default Message;
