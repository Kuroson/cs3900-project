import React, { useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneIcon from "@mui/icons-material/Done";
import EditIcon from "@mui/icons-material/Edit";
import ImportContactsIcon from "@mui/icons-material/ImportContacts";
import { IconButton, TextField } from "@mui/material";
import { ResourcesType } from "pages/admin/[courseId]/[pageId]";
import TitleWithIcon from "components/common/TitleWithIcon";
import { EditPosition } from "./ShowOrEditPage";

const ShowOrEditSectionT: React.FC<{
  title: string;
  handleEditResource: (newResource: ResourcesType, position?: EditPosition) => void;
}> = ({ title, handleEditResource }) => {
  const [sectionTitle, setSectionTitle] = useState(title);
  const [editTitle, setEditTitle] = useState(false);

  const handleEditTitle = () => {
    // click tick
    if (editTitle && title !== sectionTitle) {
      // edit whole data handleEditResource()
    }

    setEditTitle((prev) => !prev);
  };

  return (
    <div className="flex gap-2">
      {editTitle ? (
        <TextField
          id="Section Title"
          label="Section Title"
          variant="outlined"
          sx={{ maxWidth: "500px" }}
          value={sectionTitle}
          onChange={(e) => setSectionTitle(e.target.value)}
        />
      ) : (
        <TitleWithIcon text={title}>
          <ImportContactsIcon color="primary" />
        </TitleWithIcon>
      )}

      <div>
        <IconButton color="primary" aria-label="edit" component="label" onClick={handleEditTitle}>
          {editTitle ? <DoneIcon /> : <EditIcon />}
        </IconButton>
        <IconButton color="error" aria-label="delete" component="label">
          <DeleteIcon />
        </IconButton>
      </div>
    </div>
  );
};

export default ShowOrEditSectionT;
