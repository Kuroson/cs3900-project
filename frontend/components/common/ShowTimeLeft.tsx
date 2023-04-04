import React from "react";
import dayjs from "dayjs";
import relativeTimePlugin from "dayjs/plugin/relativeTime";
import utcPlugin from "dayjs/plugin/utc";

dayjs.extend(utcPlugin);
dayjs.extend(relativeTimePlugin);

type ShowTimeLeftProps = { open?: string; close: string; className?: string };

const ShowTimeLeft: React.FC<ShowTimeLeftProps> = ({ open, close, className }) => {
  const timeLeft = dayjs.utc(close).endOf("minute").fromNow();
  const pass = dayjs.utc(close) < dayjs.utc();

  const beforeOpen = dayjs.utc(open).endOf("minute").fromNow();
  const isOpen = dayjs.utc(open) < dayjs.utc() || open == null;

  return (
    <span
      className={`${
        pass ? "bg-[#979091a7]" : `${isOpen ? "bg-[#e53d56a7]" : "bg-[#26c6da]"}`
      } p-1 rounded-md font-bold text-white text-xs ${className}`}
    >
      {pass ? "Closed" : `${isOpen ? `Close ${timeLeft}` : `Open ${beforeOpen}`}`}
    </span>
  );
};

export default ShowTimeLeft;
