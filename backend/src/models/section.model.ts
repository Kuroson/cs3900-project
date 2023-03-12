import { Document, Schema, Types, model } from "mongoose";
import { Resource } from "./resource.model";

/**
 * This model represents a subsection of a page
 * that is used to parition resources (files)
 *
 * A section can have multiple files under it
 */
export interface Section extends Document {
    title: string;
    resources: Types.DocumentArray<Resource["_id"]>;
}

const sectionSchema: Schema = new Schema<Section>({
    title: { type: String, required: true },
    resources: [{ type: Schema.Types.ObjectId, ref: "Resource" }],
});

const Section = model<Section & Document>("Section", sectionSchema);

export default Section;
