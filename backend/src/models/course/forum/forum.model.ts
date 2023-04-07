import { Document, Schema, Types, model } from "mongoose";
import { FullPostInfo, PostInterface } from "./post.model";

/**
 * This is the course forum that can contain many posts from students.
 */
export interface ForumInterface extends Document {
    description?: string;
    posts: Types.DocumentArray<PostInterface["_id"]>;
}

const forumSchema: Schema = new Schema<ForumInterface>({
    description: { type: String },
    posts: [{ type: Schema.Types.ObjectId, ref: "Post", required: true }],
});

const Forum = model<ForumInterface & Document>("Forum", forumSchema);

export type FullForumInfo = Omit<ForumInterface, "posts"> & {
    posts: FullPostInfo[];
};

export default Forum;
