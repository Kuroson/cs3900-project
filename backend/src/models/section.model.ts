import { Document, Schema, Types, model } from "mongoose";
import { ResourceInterface } from "./resource.model";

/**
 * This model represents a subsection of a page
 * that is used to parition resources (files)
 *
 * A section can have multiple files under it
 */
export interface SectionInterface extends Document {
    title: string;
    resources: Types.DocumentArray<ResourceInterface["_id"]>;
}

const sectionSchema: Schema = new Schema<SectionInterface>({
    title: { type: String, required: true },
    resources: [{ type: Schema.Types.ObjectId, ref: "Resource" }],
});

const Section = model<SectionInterface & Document>("Section", sectionSchema);

export default Section;
