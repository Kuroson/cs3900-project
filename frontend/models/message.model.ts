import { MongooseDocument, MongooseId } from "models";

export interface MessageInterface extends MongooseDocument {
  message: string;
  sender: MongooseId;
}
