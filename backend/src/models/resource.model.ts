import { Document, Schema, Types, model } from "mongoose";

export interface Resource extends Document {
    title: string;
    description: string;
    fileType: string;
    linkToResource: string;
}

const resourceSchema: Schema = new Schema<Resource>({
    title: { type: String, required: true },
    description: { type: String },
    fileType: { type: String, required: true },
    linkToResource: { type: String, required: true },
});

const Resource = model<Resource & Document>("Resource", resourceSchema);

export default Resource;
