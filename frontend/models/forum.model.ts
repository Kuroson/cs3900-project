import {
    MongooseDocument,
    MongooseId,
  } from "models";
  import { PageFull } from "./page.model";
  
  export interface ForumInterface extends MongooseDocument {
    description: string;
    posts: Array<MongooseId>;
  }
  
  export type BasicForumInfo = Omit<
    ForumInterface,
    | "description"
  >;  

  export type GetForumType = {
    courseId: string;
  };