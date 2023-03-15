import { Document, Schema, Types, model } from "mongoose";
import { Course } from "./course.model";

export const STUDENT_ROLE = "1";
export const INSTRUCTOR_ROLE = "0";

/**
 * The user defines one of two user types in the system
 * They can be instructors/admins or students
 *
 * The firebase_uid should come from registration in firebase
 * Users can be enrolled in courses which is added to their enrollment list
 */
export interface User extends Document {
    firebase_uid: string;
    email: string;
    first_name: string;
    last_name: string;
    role: number; // 0=instructor, 1=student
    enrolments: Types.DocumentArray<Course["_id"]>;
    created_courses: Types.DocumentArray<Course["_id"]>;
    avatar?: string;
}

const userSchema: Schema = new Schema<User>({
    firebase_uid: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    role: { type: Number, required: true },
    enrolments: [{ type: Schema.Types.ObjectId, ref: "Course", required: true }],
    created_courses: [{ type: Schema.Types.ObjectId, ref: "Course", required: true }],
    avatar: String,
});

const User = model<User & Document>("User", userSchema);

export default User;
