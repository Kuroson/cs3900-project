import { Document, Schema, model } from "mongoose";

/**
 * A model for a resource that represents a file uploaded to the system.
 * It contains an optional description for the file.
 *
 * The file type is related to the file extension. The stored name is that
 * stored within firebase store itself used for recalling the file.
 *
 * file_type and stored_name are optional as they are only added to the resource
 * when the file is actually uploaded.
 */
export interface ResourceInterface extends Document {
    title: string;
    description?: string;
    file_type?: string;
    stored_name?: string;
}

const resourceSchema: Schema = new Schema<ResourceInterface>({
    title: { type: String, required: true },
    description: { type: String },
    file_type: { type: String },
    stored_name: { type: String },
});

const Resource = model<ResourceInterface & Document>("Resource", resourceSchema);

export default Resource;
