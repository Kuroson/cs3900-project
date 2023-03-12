import { Document, Schema, Types, model } from "mongoose";
import { Page } from "./page.model";
import { Resource } from "./resource.model";
import { User } from "./user.model";

/**
 * Model to represent a course in the system
 * A course has some base information (title, code, description,
 * session it is running in, icon, and instructor who made it)
 *
 * A course is split up to have many pages that can have information added to them
 */
export interface Course extends Document {
    title: string;
    code: string;
    description?: string;
    session: string;
    icon?: string;
    creator: User["_id"];
    pages: Types.DocumentArray<Page["_id"]>;
}

const courseSchema: Schema = new Schema<Course>({
    title: { type: String, required: true },
    code: { type: String, required: true },
    description: { type: String },
    session: { type: String, required: true },
    icon: { type: String },
    creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
    pages: [{ type: Schema.Types.ObjectId, ref: "Page", required: true }],
});

const Course = model<Course & Document>("Course", courseSchema);

export default Course;
