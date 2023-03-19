import { CourseInterface } from "./course.model";
import { PageInterface } from "./page.model";
import { ResourceInterface } from "./resource.model";
import { SectionInterface } from "./section.model";
import { UserInterface } from "./user.model";

export interface MongooseDocument {
  _id: MongooseId;
}

export type MongooseId = string;

export type { UserInterface, SectionInterface, ResourceInterface, PageInterface, CourseInterface };
