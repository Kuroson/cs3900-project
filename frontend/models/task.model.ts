import { MongooseDocument, MongooseId } from "models";

export interface TaskInterface extends MongooseDocument {
  title: string;
  description?: string;
  quiz?: MongooseId;
  assignment?: MongooseId;
  onlineClass?: MongooseId;
}
