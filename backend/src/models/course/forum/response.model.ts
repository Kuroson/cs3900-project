import { Document, Schema, model } from "mongoose";
import { UserInterface } from "@/models/user.model";

/**
 * This is a single response to a post within a forum. A response
 * can be marked as 'correct' to indicate it is accepted.
 */
export interface ResponseInterface extends Document {
    /**
     * Response text
     */
    response: string;
    correct: boolean;
    /**
     * Poster's id
     */
    poster: UserInterface["_id"];
    /**
     * UNIX time stamp
     */
    timePosted: number;
}

const responseSchema: Schema = new Schema<ResponseInterface>({
    response: { type: String, required: true },
    correct: { type: Boolean, required: true },
    poster: { type: Schema.Types.ObjectId, ref: "User", required: true },
    timePosted: { type: Number, required: true },
});

const Response = model<ResponseInterface & Document>("Response", responseSchema);

export type FullResponseInfo = Omit<ResponseInterface, "poster"> & {
    poster: UserInterface;
};

export default Response;
