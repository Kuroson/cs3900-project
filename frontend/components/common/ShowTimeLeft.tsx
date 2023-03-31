import React from "react";
import dayjs from "dayjs";
import relativeTimePlugin from "dayjs/plugin/relativeTime";
import utcPlugin from "dayjs/plugin/utc";

dayjs.extend(utcPlugin);
dayjs.extend(relativeTimePlugin);

const ShowTimeLeft: React.FC<{ time: string; className?: string }> = ({ time, className }) => {
  const timeLeft = dayjs.utc(time).endOf("minute").fromNow();
  const pass = timeLeft.includes("ago");
  return (
    <span
      className={`${
        pass ? "bg-[#979091a7]" : "bg-[#e53d56a7]"
      } p-1 rounded-md font-bold text-white text-xs ${className}`}
    >
      {pass ? "Closed" : `Closes ${timeLeft}`}
    </span>
  );
};

export default ShowTimeLeft;
