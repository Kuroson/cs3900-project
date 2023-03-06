import { Document, Schema, Types, model } from "mongoose";
import { Course } from "./course.model";

export interface User extends Document {
    firebase_uid: string;
    email: string;
    first_name: string;
    last_name: string;
    role: number; // 0=instructor, 1=student
    enrolments: Types.DocumentArray<Course["_id"]>;
    avatar?: string;
}

const userSchema: Schema = new Schema<User>({
    firebase_uid: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    role: { type: Number, required: true },
    enrolments: [{ type: Schema.Types.ObjectId, ref: "Course" }],
    avatar: String,
});

const User = model<User & Document>("User", userSchema);

export default User;
