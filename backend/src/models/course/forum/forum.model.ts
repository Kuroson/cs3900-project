import { Document, Schema, Types, model } from "mongoose";
import { PostInterface } from "./post.model";

/**
 * This is the course forum that can contain many posts from students.
 */
export interface ForumInterface extends Document {
    title: string;
    description: string;
    posts: Types.DocumentArray<PostInterface["_id"]>;
}

const forumSchema: Schema = new Schema<ForumInterface>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    posts: [{ type: Schema.Types.ObjectId, ref: "Post", required: true }],
});

const Forum = model<ForumInterface & Document>("Forum", forumSchema);

export default Forum;
