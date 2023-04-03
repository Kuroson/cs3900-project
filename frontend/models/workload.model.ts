import { MongooseDocument, MongooseId } from "models";

export interface WorkloadInterface extends MongooseDocument {
  weeks: Array<MongooseId>;
}
