import React from "react";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import RuleIcon from "@mui/icons-material/Rule";
import { Button } from "@mui/material";
import dayjs from "dayjs";
import { QuizBasicInfo } from "models/quiz.model";
import ShowTimeLeft from "components/common/ShowTimeLeft";
import TitleWithIcon from "components/common/TitleWithIcon";

// common for student and admin
const QuizInfoCard: React.FC<{
  info: QuizBasicInfo;
  isAdmin: boolean;
  handleEditInfo: (newInfo: QuizBasicInfo) => void;
}> = ({ info, isAdmin, handleEditInfo }) => {
  return (
    <div className="shadow-md p-4 rounded-lg outline outline-1 outline-gray-400 flex gap-2 flex-col">
      <div className="flex justify-between">
        <TitleWithIcon text={`Open: ${dayjs.utc(info.open).local().format("DD-MM-YYYY HH:mm:ss")}`}>
          <AccessTimeIcon color="primary" />
        </TitleWithIcon>
        <div className="flex items-center gap-5">
          <TitleWithIcon
            text={`Close: ${dayjs.utc(info.close).local().format("DD-MM-YYYY HH:mm:ss")}`}
          >
            <AccessTimeFilledIcon color="primary" />
          </TitleWithIcon>
          <ShowTimeLeft time={info.close} />
        </div>
      </div>
      <TitleWithIcon
        text={`Marks: ${info.markAwarded != null ? info.markAwarded + "/" : ""}${info.maxMarks}`}
      >
        <RuleIcon color="primary" />
      </TitleWithIcon>
      <p className="m-4">{info.description}</p>
      {isAdmin && <Button variant="contained">Edit Quiz Infomation</Button>}
    </div>
  );
};

export default QuizInfoCard;
