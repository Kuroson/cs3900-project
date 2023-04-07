import { MongooseDocument, MongooseId } from "models";

export interface MessageInterface extends MongooseDocument {
  message: string;
  sender: MongooseId;
  /**
   * UNIX timestamp
   */
  timestamp: number;
  senderName: string;
}
