import React from "react";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  Checkbox,
  ListItem,
  ListItemAvatar,
  ListItemIcon,
  ListItemText,
  TextField,
} from "@mui/material";
import { FullTaskInterface, TaskInterface } from "models/task.model";

type SingleCompleteTaskProps = {
  task: FullTaskInterface;
};

/**
 * Component for a single task
 * It is a list Item
 */
const SingleCompleteTask = ({ task }: SingleCompleteTaskProps): JSX.Element => {
  return (
    <ListItem>
      <ListItemIcon>
        <Checkbox edge="start" checked={true} disabled={true} />
      </ListItemIcon>
      <ListItemText primary={task.title} secondary={task.description} />
    </ListItem>
  );
};

export default SingleCompleteTask;
