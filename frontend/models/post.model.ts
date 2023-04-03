import {
    MongooseDocument,
    MongooseId,
    PageInterface,
    ResourceInterface,
    SectionInterface,
  } from "models";
  import { PageFull } from "./page.model";
  
  export interface PostInterface extends MongooseDocument {
    courseId: MongooseId;
    title: string;
    question: string;
    image: string;
    poster: MongooseId;
    responses: Array<MongooseId>;
  }
  
  export type BasicPostInfo = Omit<
    PostInterface,
    | "image"
    | "responses"
  >;  

  export type CreatePostType = {
    courseId: string;
    title: string;
    question: string;
    poster: string;
  };