import React from "react";
import Divider from "@mui/material/Divider";
import dayjs from "dayjs";
import relativeTimePlugin from "dayjs/plugin/relativeTime";
import utcPlugin from "dayjs/plugin/utc";
import { FullWeekInterface } from "models/week.model";
import StudentTasksSection from "../task/StudentTasksSection";

dayjs.extend(utcPlugin);
dayjs.extend(relativeTimePlugin);

type SingleStudentWeekProps = {
  week: FullWeekInterface;
};

/**
 * Component for a single Week.
 * Does not have an edit option
 */
const SingleStudentWeekSection = ({ week }: SingleStudentWeekProps): JSX.Element => {
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
          <StudentTasksSection tasks={week.tasks} />
        </div>
      </div>
    </div>
  );
};

export default SingleStudentWeekSection;
