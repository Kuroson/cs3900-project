import { FullWeekInterface } from "models/week.model";
import SingleStudentWeekSection from "./SingleWorkload";
import SingleEditableWorkload from "./SingleWorkload";

type StudentWorkloadSectionProps = {
  weeks: FullWeekInterface[];
  setWeeks: React.Dispatch<React.SetStateAction<FullWeekInterface[]>>;
  courseId: string;
};

const StudentWorkloadSection = ({ weeks }: StudentWorkloadSectionProps): JSX.Element => {
  return (
    <div className="flex flex-col w-full mb-8">
      {weeks.map((week) => {
        return <SingleStudentWeekSection week={week} key={week._id} />;
      })}
    </div>
  );
};

export default StudentWorkloadSection;
