import { FullWeekInterface } from "models/week.model";
import SingleStudentWeekSection from "./SingleWorkload";

type StudentWorkloadSectionProps = {
  weeks: FullWeekInterface[];
  setWeeks: React.Dispatch<React.SetStateAction<FullWeekInterface[]>>;
  courseId: string;
  studentId: string;
};

const StudentWorkloadSection = ({
  weeks,
  setWeeks,
  courseId,
  studentId,
}: StudentWorkloadSectionProps): JSX.Element => {
  return (
    <div className="flex flex-col w-full mb-8">
      {weeks.map((week) => {
        return (
          <SingleStudentWeekSection
            courseId={courseId}
            weekId={week._id}
            week={week}
            key={week._id}
            studentId={studentId}
          />
        );
      })}
    </div>
  );
};

export default StudentWorkloadSection;
