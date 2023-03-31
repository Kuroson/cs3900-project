import {
    MongooseDocument,
    MongooseId,
    PageInterface,
    ResourceInterface,
    SectionInterface,
  } from "models";
  import { PageFull } from "./page.model";
  
  export interface PostInterface extends MongooseDocument {
    title: string;
    question: string;
    image: string;
    poster: MongooseId;
    responses: Array<MongooseId>;
  }
  
  export type BasicPostInfo = Omit<
    PostInterface,
    | "image"
    | "poster"
    | "responses"
  >;  