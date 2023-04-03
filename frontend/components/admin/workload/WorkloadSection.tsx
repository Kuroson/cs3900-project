import { ResourceInterface } from "models";
import { FullWeekInterface, WeekInterface } from "models/week.model";
import AddNewWorkloadSection from "./AddNewWeekSection";
import SingleEditableWorkload from "./SingleEditableWorkload";

type WorkloadSectionProps = {
  weeks: FullWeekInterface[];
  setWeeks: React.Dispatch<React.SetStateAction<FullWeekInterface[]>>;
  courseId: string;
};

const WorkloadSection = ({ weeks, setWeeks, courseId }: WorkloadSectionProps): JSX.Element => {
  return (
    <div className="flex flex-col w-full mb-8">
      {weeks.map((week) => {
        return (
          <SingleEditableWorkload
            week={week}
            key={week._id}
            setWeeks={setWeeks}
            courseId={courseId}
            weeks={weeks}
          />
        );
      })}
      <div className="flex justify-center">
        <AddNewWorkloadSection courseId={courseId} setWeeks={setWeeks} weeks={weeks} />
      </div>
    </div>
  );
};

export default WorkloadSection;
