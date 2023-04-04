import { MongooseDocument } from "models";

export interface TaskInterface extends MongooseDocument {
  title: string;
  description?: string;
}
