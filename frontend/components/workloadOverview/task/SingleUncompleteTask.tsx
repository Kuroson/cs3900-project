import React from "react";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { Checkbox, ListItem, ListItemAvatar, ListItemIcon, ListItemText } from "@mui/material";
import { TaskInterface } from "models/task.model";
import { useAuthUser } from "next-firebase-auth";
import { CompleteTaskPayloadRequest, completeTask } from "util/api/workloadApi";

type SingleUncompleteTaskProps = {
  task: TaskInterface;
  courseId: string;
  weekId: string;
  studentId: string;
};

/**
 * Component for a single task
 * If an item can be checked, it shall be checked.
 */
const SingleUncompleteTask = ({
  task,
  courseId,
  weekId,
  studentId,
}: SingleUncompleteTaskProps): JSX.Element => {
  const authuser = useAuthUser();
  const [checked, setChecked] = React.useState(false);

  const handleChange = async () => {
    setChecked(!checked);

    const payload: CompleteTaskPayloadRequest = {
      studentId: studentId,
      courseId: courseId,
      weekId: weekId,
      taskId: task._id,
    };

    await completeTask(await authuser.getIdToken(), payload, "client");
  };

  if (task.quiz !== undefined || task.assignment !== undefined || task.onlineClass !== undefined) {
    return (
      <ListItem className="hover:shadow">
        <ListItemIcon>
          <Checkbox edge="start" checked={false} disabled={true} />
        </ListItemIcon>
        <ListItemText primary={task.title} secondary={task.description} />
      </ListItem>
    );
  } else {
    return (
      <ListItem className="hover:shadow">
        <ListItemIcon>
          <Checkbox
            edge="start"
            checked={checked}
            disabled={checked}
            onChange={() => handleChange()}
          />
        </ListItemIcon>
        <ListItemText primary={task.title} secondary={task.description} />
      </ListItem>
    );
  }
};

export default SingleUncompleteTask;
