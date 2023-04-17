import { OnlineClassInterface } from "models/onlineClass.model";
import { FullWeekInterface } from "models/week.model";
import SingleEditableWeekSection from "./SingleEditableWeekSection";

type WorkloadSectionProps = {
  weeks: FullWeekInterface[];
  setWeeks: React.Dispatch<React.SetStateAction<FullWeekInterface[]>>;
  courseId: string;
  onlineClasses: OnlineClassInterface[];
  setOnlineClasses: React.Dispatch<React.SetStateAction<OnlineClassInterface[]>>;
};

const WorkloadSection = ({
  weeks,
  setWeeks,
  courseId,
  onlineClasses,
  setOnlineClasses,
}: WorkloadSectionProps): JSX.Element => {
  return (
    <div className="flex flex-col w-full mb-8">
      {weeks.map((week) => {
        return (
          <SingleEditableWeekSection
            week={week}
            key={week._id}
            setWeeks={setWeeks}
            courseId={courseId}
            weeks={weeks}
            onlineClasses={onlineClasses}
            setOnlineClasses={setOnlineClasses}
          />
        );
      })}
    </div>
  );
};

export default WorkloadSection;
