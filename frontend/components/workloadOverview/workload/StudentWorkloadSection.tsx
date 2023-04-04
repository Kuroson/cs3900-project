import { FullWeekInterface } from "models/week.model";
import SingleEditableWorkload from "./SingleWorkload";

type StudentWorkloadSectionProps = {
  weeks: FullWeekInterface[];
  setWeeks: React.Dispatch<React.SetStateAction<FullWeekInterface[]>>;
  courseId: string;
};

const StudentWorkloadSection = ({
  weeks,
  setWeeks,
  courseId,
}: StudentWorkloadSectionProps): JSX.Element => {
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

export default StudentWorkloadSection;
