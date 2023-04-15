import { FullWeekInterface, WeekInterface } from "models/week.model";
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
    </div>
  );
};

export default WorkloadSection;
