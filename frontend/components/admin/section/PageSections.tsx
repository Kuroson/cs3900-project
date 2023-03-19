import React from "react";
import { SectionFull } from "models/section.model";
import SingleEditableSection from "./SingleEditableSection";

type PageSectionsProps = {
  sections: SectionFull[];
  setSections: React.Dispatch<React.SetStateAction<SectionFull[]>>;
  pageId: string;
  courseId: string;
};

const PageSections = ({
  sections,
  setSections,
  pageId,
  courseId,
}: PageSectionsProps): JSX.Element => {
  return (
    <div>
      {sections.map((section) => {
        return (
          <SingleEditableSection
            key={section._id}
            section={section}
            sections={sections}
            setSections={setSections}
            pageId={pageId}
            courseId={courseId}
          />
        );
      })}
    </div>
  );
};

export default PageSections;
