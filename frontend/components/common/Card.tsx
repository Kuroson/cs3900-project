import React from "react";
import AssignmentIcon from "@mui/icons-material/Assignment";
import QuizIcon from "@mui/icons-material/Quiz";
import ShowTimeLeft from "./ShowTimeLeft";

// Card for quiz or assignment
const Card: React.FC<{ text: string; close: string; isQuiz: boolean; handleOpen: () => void }> = ({
  text,
  close,
  isQuiz,
  handleOpen,
}) => {
  return (
    <div
      className="flex flex-col rounded-lg items-center gap-7 shadow-md px-5 pt-2 pb-3 my-2 mx-5 w-[350px] min-h-[160px] cursor-pointer hover:shadow-lg"
      onClick={handleOpen}
    >
      {/* show time left */}
      <ShowTimeLeft time={close} className="self-end mt-3" />
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
