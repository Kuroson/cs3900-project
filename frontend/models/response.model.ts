import { MongooseDocument, MongooseId } from "models";
import { UserDetails } from "./user.model";

export interface ResponseInterface extends MongooseDocument {
  response: string;
  correct: boolean;
  poster: MongooseId;
}

export type BasicResponseInfo = Omit<ResponseInterface, "poster"> & {
  poster: UserDetails;
};

export type CreateResponseType = {
  postId: string;
  text: string;
};
