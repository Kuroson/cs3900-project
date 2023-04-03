import React from "react";
import AssignmentIcon from "@mui/icons-material/Assignment";
import QuizIcon from "@mui/icons-material/Quiz";
import ShowTimeLeft from "./ShowTimeLeft";

type CardProps = {
  text: string;
  close: string;
  isQuiz: boolean;
  handleOpen: () => void;
  open?: string;
};

// Card for quiz or assignment
const Card: React.FC<CardProps> = ({ text, close, isQuiz, handleOpen, open }): JSX.Element => {
  return (
    <div
      className="flex flex-col rounded-lg items-center gap-7 shadow-md px-5 pt-2 pb-3 my-2 mx-5 w-[330px] min-h-[160px] cursor-pointer hover:shadow-lg"
      onClick={handleOpen}
    >
      {/* show time left */}
      <ShowTimeLeft close={close} open={open} className="self-end mt-3" />
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
