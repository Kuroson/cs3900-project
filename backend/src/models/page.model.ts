import { Document, Schema, Types, model } from "mongoose";
import { Resource } from "./resource.model";
import { Section } from "./section.model";

export interface Page extends Document {
    title: string;
    sections: Types.DocumentArray<Section["_id"]>;
    resources: Types.DocumentArray<Resource["_id"]>;
}

const pageSchema: Schema = new Schema<Page>({
    title: { type: String, required: true },
    sections: [{ type: Schema.Types.ObjectId, ref: "Section" }],
    resources: [{ type: Schema.Types.ObjectId, ref: "Resource" }],
});

const Page = model<Page & Document>("Page", pageSchema);

export default Page;
