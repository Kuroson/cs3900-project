import React, { useState } from "react";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import RuleIcon from "@mui/icons-material/Rule";
import { Box, Button, Modal } from "@mui/material";
import dayjs from "dayjs";
import { QuizBasicInfo } from "models/quiz.model";
import ShowTimeLeft from "components/common/ShowTimeLeft";
import TitleWithIcon from "components/common/TitleWithIcon";
import AddOrEditQuiz from "./AddOrEditQuiz";

// common for student and admin
const QuizInfoCard: React.FC<{
  info: QuizBasicInfo;
  isAdmin: boolean;
  handleEditInfo?: (newInfo: QuizBasicInfo) => void;
}> = ({ info, isAdmin, handleEditInfo }) => {
  const [isEditing, setIsEditing] = useState(false);

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
        text={`Marks: ${info.markAwarded != null ? info.markAwarded + "/" : "?/"}${info.maxMarks}`}
      >
        <RuleIcon color="primary" />
      </TitleWithIcon>
      <p className="m-4 break-all text-lg">{info.description}</p>
      {/* Just for admin -> edit information */}
      {isAdmin && (
        <Button variant="contained" onClick={() => setIsEditing((prev) => !prev)}>
          Edit Quiz Infomation
        </Button>
      )}
      <Modal
        open={isEditing}
        onClose={() => setIsEditing((prev) => !prev)}
        aria-labelledby="edit quiz information"
        aria-describedby="edit quiz information"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "100vw",
            maxWidth: "700px",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 20,
          }}
        >
          <AddOrEditQuiz
            closeQuiz={() => setIsEditing((prev) => !prev)}
            info={info}
            isEditing={true}
            handleEditInfo={handleEditInfo}
          />
        </Box>
      </Modal>
    </div>
  );
};

export default QuizInfoCard;
