import React, { useEffect } from "react";
import Divider from "@mui/material/Divider";
import dayjs from "dayjs";
import relativeTimePlugin from "dayjs/plugin/relativeTime";
import utcPlugin from "dayjs/plugin/utc";
import { CompleteWeekInterface, FullWeekInterface } from "models/week.model";
import { useAuthUser } from "next-firebase-auth";
import { getWeek } from "util/api/workloadApi";
import StudentTasksSection from "../task/StudentTasksSection";

dayjs.extend(utcPlugin);
dayjs.extend(relativeTimePlugin);

type SingleStudentWeekProps = {
  courseId: string;
  weekId: string;
  week: FullWeekInterface;
  studentId: string;
};

/**
 * Component for a single Week.
 * Does not have an edit option
 */
const SingleStudentWeekSection = ({
  courseId,
  weekId,
  week,
  studentId,
}: SingleStudentWeekProps): JSX.Element => {
  const authUser = useAuthUser();
  const [weekInfo, setWeekInfo] = React.useState<CompleteWeekInterface>();

  useEffect(() => {
    const getWeekInfo = async () => {
      const [res, err] = await getWeek(
        await authUser.getIdToken(),
        { courseId: courseId, weekId: weekId, studentId: studentId },
        "client",
      );
      if (err !== null) {
        console.error(err);
        return; // toast
      }
      if (res === null) throw new Error("Response and error are null");
      console.warn(res);
      setWeekInfo(res);
    };
    getWeekInfo();
  }, [authUser, weekId, courseId, studentId]);

  console.warn(weekInfo);

  return (
    <div className="p-3">
      <div
        className="w-full py-5 px-10 rounded-lg border-solid border-5 border-[#26a69a;]"
        data-cy={`section-${week.title}`}
      >
        <div className="w-full items-end">
          <div className="flex-row flex w-full justify-between">
            <div>
              <span className="w-full text-xl font-medium flex flex-col">{week.title}</span>
              <span className="w-full text-sm flex flex-col">
                <i>Due {dayjs.utc(week.deadline).endOf("minute").fromNow()}</i>
              </span>
              {/* Description */}
              {week.description !== undefined && <p>{week.description}</p>}
              {/* Resource */}
            </div>
          </div>
        </div>
        <Divider />
        <div>
          <StudentTasksSection
            completedTasks={weekInfo?.completedTasks}
            uncompletedTasks={weekInfo?.uncompletedTasks}
            courseId={courseId}
            weekId={weekId}
            studentId={studentId}
          />
        </div>
      </div>
    </div>
  );
};

export default SingleStudentWeekSection;
