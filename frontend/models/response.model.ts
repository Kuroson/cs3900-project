import { MongooseDocument, MongooseId, UserInterface } from "models";

export interface ResponseInterface extends MongooseDocument {
  /**
   * Response text
   */
  response: string;
  correct: boolean;
  /**
   * Poster's id
   */
  poster: MongooseId;
  /**
   * UNIX time stamp
   */
  timePosted: number;
}

export type FullResponseInfo = Omit<ResponseInterface, "poster"> & {
  poster: UserInterface;
};
