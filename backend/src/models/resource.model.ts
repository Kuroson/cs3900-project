import { Document, Schema, Types, model } from "mongoose";

export interface Resource extends Document {
    title: string;
    description?: string;
    file_type?: string;
    stored_name?: string;
}

const resourceSchema: Schema = new Schema<Resource>({
    title: { type: String, required: true },
    description: { type: String },
    file_type: { type: String },
    stored_name: { type: String },
});

const Resource = model<Resource & Document>("Resource", resourceSchema);

export default Resource;
