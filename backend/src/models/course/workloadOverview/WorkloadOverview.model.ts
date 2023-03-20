import { Document, Schema, Types, model } from "mongoose";
import { WeekInterface } from "./week.model";

/**
 * This is the course overview where granular tasks can be assigned for
 * each week that students can view.
 */
export interface WorkloadOverviewInterface extends Document {
    description: string;
    weeks: Types.DocumentArray<WeekInterface["_id"]>;
}

const workloadOverviewSchema: Schema = new Schema<WorkloadOverviewInterface>({
    description: { type: String, required: true },
    weeks: [{ type: Schema.Types.ObjectId, ref: "Week", required: true }],
});

const WorkloadOverview = model<WorkloadOverviewInterface & Document>(
    "WorkloadOverview",
    workloadOverviewSchema,
);

export default WorkloadOverview;
