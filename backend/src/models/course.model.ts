import { Document, Schema, Types, model } from "mongoose";
import { Page } from "./page.model";
import { Resource } from "./resource.model";
import { User } from "./user.model";

export interface Course extends Document {
    title: string;
    code: string;
    description?: string;
    session: string;
    icon?: string;
    creator: User["_id"];
    pages: Types.DocumentArray<Page["_id"]>;
    resources: Types.DocumentArray<Resource["_id"]>;
}

const courseSchema: Schema = new Schema<Course>({
    title: { type: String, required: true },
    code: { type: String, required: true },
    description: { type: String },
    session: { type: String, required: true },
    icon: { type: String },
    creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
    pages: [{ type: Schema.Types.ObjectId, ref: "Page", required: true }],
    resources: [{ type: Schema.Types.ObjectId, ref: "Resource", required: true }],
});

const Course = model<Course & Document>("Course", courseSchema);

export default Course;
