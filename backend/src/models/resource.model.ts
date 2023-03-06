import { Document, Schema, Types, model } from "mongoose";

export interface Resource extends Document {
    title: string;
    description?: string;
    file_type: string;
    link_to_resources: string;
}

const resourceSchema: Schema = new Schema<Resource>({
    title: { type: String, required: true },
    description: { type: String },
    file_type: { type: String, required: true },
    link_to_resources: { type: String, required: true },
});

const Resource = model<Resource & Document>("Resource", resourceSchema);

export default Resource;
