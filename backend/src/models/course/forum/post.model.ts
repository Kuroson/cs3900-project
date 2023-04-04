import { UserInterface } from "@/models/user.model";
import { Document, Schema, Types, model } from "mongoose";
import { CourseInterface } from "../course.model";
import { ResponseInterface } from "./response.model";

/**
 * This is a post that is made within the online forum by a student.
 * It can have multiple attached responses by others. The image should
 * be encoded in base64.
 */
export interface PostInterface extends Document {
    courseId: CourseInterface["_id"];
    title: string;
    question: string;
    image?: string;
    poster: UserInterface["_id"];
    responses: Types.DocumentArray<ResponseInterface["_id"]>;
}

//Note changed image and responses to not required, to be changed back to remain consistent
const postSchema: Schema = new Schema<PostInterface>({
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    title: { type: String, required: true },
    question: { type: String, required: true },
    image: { type: String },
    poster: { type: Schema.Types.ObjectId, ref: "User", required: true },
    responses: [{ type: Schema.Types.ObjectId, ref: "Response" }],
});

const Post = model<PostInterface & Document>("Post", postSchema);

export default Post;
