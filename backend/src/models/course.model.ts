import { Document, Schema, Types, model } from "mongoose";
import { Page } from "./page.model";
import { User } from "./user.model";

export interface Course extends Document {
    title: string;
    code: string;
    description?: string;
    session: string;
    icon?: string;
    creator: User["_id"];
    pages?: Types.DocumentArray<Page["_id"]>;
    students?: Types.DocumentArray<User["_id"]>;
}

const courseSchema: Schema = new Schema<Course>({
    title: { type: String, required: true },
    code: { type: String, required: true },
    description: { type: String },
    session: { type: String, required: true },
    icon: { type: String },
    creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
    pages: [{ type: Schema.Types.ObjectId, ref: "Page" }],
    students: [{ type: Schema.Types.ObjectId, ref: "User" }],
});

const Course = model<Course & Document>("Course", courseSchema);

export default Course;
