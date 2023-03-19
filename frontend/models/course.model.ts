import {
  MongooseDocument,
  MongooseId,
  PageInterface,
  ResourceInterface,
  SectionInterface,
} from "models";
import { PageFull } from "./page.model";

export interface CourseInterface extends MongooseDocument {
  title: string;
  code: string;
  description?: string;
  session: string;
  icon?: string;
  creator: MongooseId;
  pages: Array<MongooseId>;
  students: Array<MongooseId>;
}

export type BasicCourseInfo = Omit<CourseInterface, "creator" | "pages" | "students">;

export type UserCourseInformation = Omit<CourseInterface, "students" | "pages" | "creator"> & {
  pages: PageFull[];
};

let r: Omit<PageInterface, "section" | "resources">;
