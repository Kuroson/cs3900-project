import { MongooseDocument, MongooseId } from "models";
import { BasicCourseInfo } from "./course.model";

export interface EnrolmentInterface extends MongooseDocument {
  student: MongooseId;
  course: MongooseId;
  quizAttempts: Array<MongooseId>;
  assignmentSubmissions: Array<MongooseId>;
  workloadCompletion: Array<MongooseId>;
}

export type UserEnrolmentInformation = Omit<
  EnrolmentInterface,
  "student" | "quizAttempts" | "assignmentSubmissions" | "workloadCompletion"
> & {
  course: BasicCourseInfo;
};
