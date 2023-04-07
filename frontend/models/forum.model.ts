import { MongooseDocument, MongooseId } from "models";
import { FullPostInfo } from "./post.model";

export interface ForumInterface extends MongooseDocument {
  description: string;
  posts: Array<MongooseId>;
}

export type BasicForumInfo = Omit<ForumInterface, "description">;

export type FullForumInfo = Omit<ForumInterface, "posts" | "description"> & {
  posts: Array<FullPostInfo>;
};

// FIXME remove this
export type GetForumType = {
  courseId: string;
};
