import { Document, Schema, Types, model } from "mongoose";
import { Section } from "./section.model";

export interface Page extends Document {
    title: string;
    sections: Types.DocumentArray<Section["_id"]>;
}

const pageSchema: Schema = new Schema<Page>({
    title: { type: String, required: true },
    sections: [{ type: Schema.Types.ObjectId, ref: "Section" }],
});

const Page = model<Page & Document>("Page", pageSchema);

export default Page;
