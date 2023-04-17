import { MongooseDocument, MongooseId, ResourceInterface } from "models";
import { SectionFull } from "./section.model";
import { FullWeekInterface } from "./week.model";

export interface PageInterface extends MongooseDocument {
  title: string;
  sections: Array<MongooseId>;
  resources: Array<MongooseId>;
  workload?: MongooseId;
}

export type PageFull = Omit<PageInterface, "sections" | "resources"> & {
  workload: FullWeekInterface;
  sections: Array<SectionFull>;
  resources: ResourceInterface[];
  // Idk why the type isn't inferred here
  title: string;
  _id: MongooseId;
};
