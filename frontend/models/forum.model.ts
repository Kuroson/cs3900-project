import {
  MongooseDocument,
  MongooseId,
} from "models";
import { PageFull } from "./page.model";
import { BasicPostInfo, PostInterface } from "./post.model";

export interface ForumInterface extends MongooseDocument {
  description: string;
  posts: Array<MongooseId>;
}

export type BasicForumInfo = Omit<
  ForumInterface,
  | "description"
>;

export type PopulatedForumInterface = Omit<
  ForumInterface,
  | "posts"
  | "description"
    > & {
  posts: Array<BasicPostInfo>;
}


export type GetForumType = {
  courseId: string;
};