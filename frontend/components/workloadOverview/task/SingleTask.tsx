import React from "react";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { ListItem, ListItemAvatar, ListItemText, TextField } from "@mui/material";
import { TaskInterface } from "models/task.model";

type SingleTaskProps = {
  task: TaskInterface;
};

/**
 * Component for a single task
 * It is a list Item
 */
const SingleTask = ({ task }: SingleTaskProps): JSX.Element => {
  return (
    <ListItem>
      <ListItemAvatar>
        <CheckBoxOutlineBlankIcon fontSize="large" />
      </ListItemAvatar>
      <ListItemText primary={task.title} secondary={task.description} />
    </ListItem>
  );
};

export default SingleTask;
