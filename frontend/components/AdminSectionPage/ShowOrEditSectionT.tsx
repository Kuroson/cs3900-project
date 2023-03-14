import React, { useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneIcon from "@mui/icons-material/Done";
import EditIcon from "@mui/icons-material/Edit";
import ImportContactsIcon from "@mui/icons-material/ImportContacts";
import { IconButton, TextField } from "@mui/material";
import TitleWithIcon from "components/common/TitleWithIcon";

const ShowOrEditSectionT: React.FC<{ title: string; editing: boolean }> = ({ title, editing }) => {
  const [sectionTitle, setSectionTitle] = useState(title);
  const [editTitle, setEditTitle] = useState(false);

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
      {/* edit mode - edit and delete */}
      {editing && (
        <div>
          <IconButton color="primary" aria-label="edit" component="label">
            {editTitle ? <DoneIcon /> : <EditIcon />}
          </IconButton>
          <IconButton color="error" aria-label="delete" component="label">
            <DeleteIcon />
          </IconButton>
        </div>
      )}
    </div>
  );
};

export default ShowOrEditSectionT;
