import React from "react";
import AssignmentIcon from "@mui/icons-material/Assignment";
import QuizIcon from "@mui/icons-material/Quiz";
import dayjs from "dayjs";
import relativeTimePlugin from "dayjs/plugin/relativeTime";
import utcPlugin from "dayjs/plugin/utc";

dayjs.extend(utcPlugin);
dayjs.extend(relativeTimePlugin);

// Card for quiz or assignment
const Card: React.FC<{ text: string; close: string; isQuiz: boolean }> = ({
  text,
  close,
  isQuiz,
}) => {
  const timeLeft = dayjs.utc(close).endOf("minute").fromNow();

  return (
    <div className="flex flex-col rounded-lg items-center gap-7 shadow-md px-5 pt-2 pb-3 my-2 mx-5 w-[350px] min-h-[160px] cursor-pointer hover:shadow-lg">
      {/* show time left */}
      <span className="bg-[#e53d56a7] p-1 rounded-md font-bold text-white text-xs self-end mt-3">
        Close {timeLeft}
      </span>
      <div className="flex gap-2 max-w-[350px]">
        {isQuiz ? (
          <QuizIcon color="primary" fontSize="large" />
        ) : (
          <AssignmentIcon color="primary" fontSize="large" />
        )}
        <h2 className="break-all">{text}</h2>
      </div>
    </div>
  );
};

export default Card;
