import { MongooseDocument, MongooseId, ResourceInterface, SectionInterface } from "models";
import { SectionFull } from "./section.model";

export interface PageInterface extends MongooseDocument {
  title: string;
  sections: Array<MongooseId>;
  resources: Array<MongooseId>;
}

export type PageFull = Omit<PageInterface, "sections" | "resources"> & {
  sections: Array<SectionFull>;
  resources: ResourceInterface[];
  // Idk why the type isn't inferred here
  title: string;
  _id: MongooseId;
};
