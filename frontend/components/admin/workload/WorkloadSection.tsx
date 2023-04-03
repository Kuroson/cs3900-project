import { ResourceInterface } from "models";
import AddNewWorkloadSection from "./AddNewWorkloadSection";
import SingleEditableWorkload from "./SingleEditableWorkload";

type WorkloadSectionProps = {
  resources: ResourceInterface[];
  setResources: React.Dispatch<React.SetStateAction<ResourceInterface[]>>;
  courseId: string;
  pageId: string;
  sectionId: string | null;
};

const WorkloadSection = ({
  resources,
  setResources,
  courseId,
  pageId,
  sectionId,
}: WorkloadSectionProps): JSX.Element => {
  return (
    <div className="flex flex-col w-full mb-8">
      {resources.map((resource) => {
        return (
          <SingleEditableWorkload
            resource={resource}
            key={resource._id}
            setResources={setResources}
            pageId={pageId}
            courseId={courseId}
            resources={resources}
            sectionId={sectionId}
          />
        );
      })}
      <AddNewWorkloadSection
        courseId={courseId}
        pageId={pageId}
        setResources={setResources}
        resources={resources}
        sectionId={sectionId}
      />
    </div>
  );
};

export default WorkloadSection;
