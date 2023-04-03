import { MongooseDocument, MongooseId } from "models";

export interface WeekInterface extends MongooseDocument {
  title: string;
  description?: string;
  tasks: Array<MongooseId>;
}
