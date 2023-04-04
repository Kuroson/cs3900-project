import { MongooseDocument, MongooseId, UserInterface } from "models";
import { UserDetails } from "./user.model";

export interface ResponseInterface extends MongooseDocument {
  response: string;
  correct: boolean;
  /**
   * Poster's id
   */
  poster: MongooseId;
  timePosted: number;
}

export type FullResponseInfo = Omit<ResponseInterface, "poster"> & {
  user: UserInterface;
};
