import { MongooseDocument } from "models";

export interface ResourceInterface extends MongooseDocument {
  title: string;
  description?: string;
  file_type?: string;
  stored_name?: string;
}
