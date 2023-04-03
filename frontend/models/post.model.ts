import {
    MongooseDocument,
    MongooseId,
    PageInterface,
    ResourceInterface,
    SectionInterface,
  } from "models";
  import { PageFull } from "./page.model";
import { UserDetails } from "./user.model";
import { ResponseInterface, BasicResponseInfo } from "./response.model";
  
  export interface PostInterface extends MongooseDocument {
    courseId: MongooseId;
    title: string;
    question: string;
    image: string;
    poster: MongooseId;
    responses: Array<MongooseId> | null;
  }
  
  export type BasicPostInfo = Omit<
    PostInterface,
    | "poster"
    | "responses"
  > & {
    poster: UserDetails;
    responses: Array<BasicResponseInfo> | null;
  };  

  export type CreatePostType = {
    courseId: string;
    title: string;
    question: string;
    poster: UserDetails;
    image: string;
    responses: Array<BasicResponseInfo> | null;
  };