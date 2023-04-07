import { Document, Schema, Types, model } from "mongoose";
import { WeekInterface } from "../workloadOverview/week.model";
import { ResourceInterface } from "./resource.model";
import { SectionInterface } from "./section.model";

/**
 * Course pages denote a custom page for the course
 *
 * Course pages are can have resources that are files uploaded to the course.
 * The resources may be directly on the page or partitioned into sections
 * (where each section has its own resources);
 */
export interface PageInterface extends Document {
    title: string;
    sections: Types.DocumentArray<SectionInterface["_id"]>;
    resources: Types.DocumentArray<ResourceInterface["_id"]>;
    workload?: WeekInterface["_id"];
}

const pageSchema: Schema = new Schema<PageInterface>({
    title: { type: String, required: true },
    sections: [{ type: Schema.Types.ObjectId, ref: "Section", required: true }],
    resources: [{ type: Schema.Types.ObjectId, ref: "Resource", required: true }],
    workload: { type: Schema.Types.ObjectId, ref: "Week" },
});

const Page = model<PageInterface & Document>("Page", pageSchema);

export default Page;
