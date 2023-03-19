import { MongooseDocument, MongooseId, ResourceInterface } from "models";

export interface SectionInterface extends MongooseDocument {
  title: string;
  resources: Array<MongooseId>;
}

export type SectionFull = Omit<SectionInterface, "resources"> & {
  resources: ResourceInterface[];
};
