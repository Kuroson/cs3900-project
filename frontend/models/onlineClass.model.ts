import { MongooseDocument, MongooseId } from "models";
import { MessageInterface } from "./message.model";

export interface OnlineClassInterface extends MongooseDocument {
  title: string;
  description: string;
  /**
   * Unix time stamp of when the class starts
   */
  startTime: number;
  /**
   * YouTube URL
   */
  linkToClass: string;
  running: boolean;
  chatMessages: Array<MongooseId>;
  chatEnabled: boolean;
  attendanceList: Array<MongooseId>;
  task?: MongooseId;
}

export type OnlineClassFull = Omit<OnlineClassInterface, "chatMessages"> & {
  chatMessages: Array<MessageInterface>;
};

export type OnlineClassUserInformation = Omit<OnlineClassInterface, "chatMessages">;
