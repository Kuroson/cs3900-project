import {
  MongooseDocument,
  MongooseId,
  PageInterface,
  ResourceInterface,
  SectionInterface,
} from "models";
import { ForumInterface, BasicForumInfo, PopulatedForumInterface } from "./forum.model";
import { OnlineClassInterface } from "./onlineClass.model";
import { PageFull } from "./page.model";

export interface CourseInterface extends MongooseDocument {
  title: string;
  code: string;
  description?: string;
  session: string;
  icon?: string;
  creator: MongooseId;
  students: Array<MongooseId>;
  pages: Array<MongooseId>;
  onlineClasses: Array<MongooseId>;
  forum: MongooseId;
  quizzes: Array<MongooseId>;
  assignments: Array<MongooseId>;
  workloadOverview: MongooseId;
  tags: Array<string>;
}

export type BasicCourseInfo = Omit<
  CourseInterface,
  | "creator"
  | "students"
  | "pages"
  | "onlineClasses"
  | "forum"
  | "quizzes"
  | "assignments"
  | "workloadOverview"
  | "tags"
>;

export type UserCourseInformation = Omit<
  CourseInterface,
  | "creator"
  | "students"
  | "pages"
  | "forum"
  | "onlineClasses"
  | "quizzes"
  | "assignments"
  | "workloadOverview"
> & {
  pages: PageFull[];
  onlineClasses: Array<OnlineClassInterface>;
  forum: PopulatedForumInterface;
};
