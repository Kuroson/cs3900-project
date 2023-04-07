import { MongooseDocument, MongooseId, UserInterface } from "models";
import { FullResponseInfo } from "./response.model";

export interface PostInterface extends MongooseDocument {
  courseId: MongooseId;
  title: string;
  question: string;
  image?: string;
  poster: MongooseId;
  responses: Array<MongooseId>;
  /**
   * UNIX timestamp
   */
  timeCreated: number;
}

export type FullPostInfo = Omit<PostInterface, "poster" | "responses"> & {
  poster: UserInterface;
  responses: Array<FullResponseInfo>;
};
