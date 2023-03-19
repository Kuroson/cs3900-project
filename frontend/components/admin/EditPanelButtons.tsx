import React from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneIcon from "@mui/icons-material/Done";
import EditIcon from "@mui/icons-material/Edit";
import { IconButton } from "@mui/material";

type EditPanelButtonsProps = {
  editMode: boolean;
  handleEditClick: () => Promise<void>;
  handleRemoveClick: () => Promise<void>;
};

/**
 * Edit and delete buttons
 */
const EditPanelButtons = ({
  handleEditClick,
  editMode,
  handleRemoveClick,
}: EditPanelButtonsProps): JSX.Element => {
  return (
    <div className="">
      <IconButton
        color="primary"
        aria-label="edit"
        component="label"
        onClick={handleEditClick}
        // disabled={editResource && title === ""}
      >
        {editMode ? <DoneIcon /> : <EditIcon />}
      </IconButton>
      <IconButton color="error" aria-label="delete" component="label" onClick={handleRemoveClick}>
        <DeleteIcon />
      </IconButton>
    </div>
  );
};

export default EditPanelButtons;
