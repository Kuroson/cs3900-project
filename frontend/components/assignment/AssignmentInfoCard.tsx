import React, { useState } from "react";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import RuleIcon from "@mui/icons-material/Rule";
import { Box, Button, Modal } from "@mui/material";
import dayjs from "dayjs";
import { AssignmentInfoType } from "models/assignment.model";
import ShowTimeLeft from "components/common/ShowTimeLeft";
import TitleWithIcon from "components/common/TitleWithIcon";
import AddOrEditAssignment from "./AddOrEditAssignment";

type AssignmentInfoCardProps = {
  info: AssignmentInfoType;
  isAdmin: boolean;
  handleEditInfo?: (newInfo: AssignmentInfoType) => void;
};

// common for student and admin
const AssignmentInfoCard: React.FC<AssignmentInfoCardProps> = ({
  info,
  isAdmin,
  handleEditInfo,
}): JSX.Element => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="shadow-md p-4 rounded-lg outline outline-1 outline-gray-400 flex gap-2 flex-col">
      <div className="flex justify-between">
        <TitleWithIcon
          text={`Deadline: ${dayjs.utc(info.deadline).local().format("DD-MM-YYYY HH:mm:ss")}`}
        >
          <AccessTimeFilledIcon color="primary" />
        </TitleWithIcon>
        <div className="flex items-center gap-5">
          <ShowTimeLeft time={info.deadline} />
        </div>
      </div>
      <TitleWithIcon
        text={`Marks: ${info.markAwarded != null ? info.markAwarded + "/" : "?/"}${
          info.marksAvailable
        }`}
      >
        <RuleIcon color="primary" />
      </TitleWithIcon>
      {info.description && <p className="m-4 break-all text-lg">{info.description}</p>}
      {/* Just for admin -> edit information */}
      {isAdmin && (
        <Button variant="contained" onClick={() => setIsEditing((prev) => !prev)}>
          Edit Assignment Infomation
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
          <AddOrEditAssignment
            closeAssignment={() => setIsEditing((prev) => !prev)}
            info={info}
            isEditing={true}
            handleEditInfo={handleEditInfo}
          />
        </Box>
      </Modal>
    </div>
  );
};

export default AssignmentInfoCard;
