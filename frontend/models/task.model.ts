import { MongooseDocument, MongooseId } from "models";

export interface TaskInterface extends MongooseDocument {
  title: string;
  description?: string;
  quiz?: MongooseId;
  assignment?: MongooseId;
  onlineClass?: MongooseId;
}

export type FullTaskInterface = Omit<TaskInterface, "quiz" | "assignment" | "onlineClass"> & {
  quiz: {
    _id: MongooseId;
    title: string;
    description?: string;
  };
  assignment: {
    _id: MongooseId;
    title: string;
    description?: string;
  };
  onlineClass: {
    _id: MongooseId;
    title: string;
    description?: string;
  };
};
