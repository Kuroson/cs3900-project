import { MongooseDocument, MongooseId } from "models";
import { FullWeekInterface } from "./week.model";

export interface WorkloadInterface extends MongooseDocument {
  weeks: Array<MongooseId>;
}

export type FullWorkloadInfo = Omit<WorkloadInterface, "weeks"> & {
  weeks: Array<FullWeekInterface>;
};
