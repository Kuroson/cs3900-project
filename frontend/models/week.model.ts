import { MongooseDocument, MongooseId } from "models";
import { TaskInterface } from "./task.model";

export interface WeekInterface extends MongooseDocument {
  title: string;
  description?: string;
  tasks: Array<MongooseId>;
}

export type FullWeekInterface = Omit<WeekInterface, "tasks"> & {
  tasks: Array<TaskInterface>;
};
