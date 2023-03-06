import { Document, Schema, Types, model } from "mongoose";
import { Page } from "./page.model";
import { User } from "./user.model";

export interface Course extends Document {
    title: string;
    description: string;
    session: string;
    courseIcon: string;
    creator: User["_id"];
    pages?: Types.DocumentArray<Page["_id"]>;
}

const courseSchema: Schema = new Schema<Course>({
    title: { type: String, required: true },
    description: { type: String },
    session: { type: String, required: true },
    courseIcon: { type: String, required: true },
    creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
    pages: [{ type: Schema.Types.ObjectId, ref: "Page" }],
});

const Course = model<Course & Document>("Course", courseSchema);

export default Course;
