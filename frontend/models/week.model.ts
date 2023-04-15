import { MongooseDocument, MongooseId } from "models";
import { TaskInterface } from "./task.model";

export interface WeekInterface extends MongooseDocument {
  title: string;
  description?: string;
  deadline: string;
  tasks: Array<MongooseId>;
}

export type FullWeekInterface = Omit<WeekInterface, "tasks"> & {
  tasks: Array<TaskInterface>;
};

export type CompleteWeekInterface = Omit<WeekInterface, "tasks"> & {
  uncompletedTasks: Array<TaskInterface>;
  completedTasks: Array<TaskInterface>;
};

export type CompleteWeekType = {
  title: string;
  description?: string;
  deadline: string;
  tasks: Array<MongooseId>;
};
