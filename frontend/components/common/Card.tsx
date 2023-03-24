import React from "react";
import AssignmentIcon from "@mui/icons-material/Assignment";
import QuizIcon from "@mui/icons-material/Quiz";

const Card: React.FC<{ text: string; close: string; isQuiz: boolean }> = ({
  text,
  close,
  isQuiz,
}) => {
  return (
    <div className="flex flex-col rounded-lg items-center justify-center gap-2 shadow-md p-5 my-2 mx-5 w-[300px] h-[200px] cursor-pointer hover:shadow-lg">
      {/* show time left */}
      <span></span>
      {isQuiz ? (
        <QuizIcon color="primary" fontSize="large" />
      ) : (
        <AssignmentIcon color="primary" fontSize="large" />
      )}
      <h2>{text}</h2>
    </div>
  );
};

export default Card;
