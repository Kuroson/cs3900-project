import { Document, Schema, connect, model } from "mongoose";

export interface User {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
}

const userSchema: Schema = new Schema<User>({
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    avatar: String,
});

const User = model<User & Document>("User", userSchema);

export default User;
