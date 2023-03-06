import { Document, Schema, Types, model } from "mongoose";
import { Course } from "./course.model";

export interface User extends Document {
    email: string;
    firstName: string;
    lastName: string;
    role: number; // 0=instructor, 1=student
    enrolments: Types.DocumentArray<Course["_id"]>;
    avatar?: string;
}

const userSchema: Schema = new Schema<User>({
    email: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: { type: Number, required: true },
    enrolments: [{ type: Schema.Types.ObjectId, ref: "Course" }],
    avatar: String,
});

const User = model<User & Document>("User", userSchema);

export default User;
