import React from "react";
import { toast } from "react-toastify";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton, ListItem, ListItemAvatar, ListItemText, TextField } from "@mui/material";
import { TaskInterface } from "models/task.model";
import { useAuthUser } from "next-firebase-auth";
import { HttpException } from "util/HttpExceptions";
import {
  DeleteTaskPayloadRequest,
  UpdateTaskPayloadRequest,
  deleteTask,
  updateTask,
} from "util/api/workloadApi";
import EditPanelButtons from "../EditPanelButtons";

type SingleEditableTaskProps = {
  weekId: string;
  task: TaskInterface;
  setTasks: React.Dispatch<React.SetStateAction<TaskInterface[]>>;
  tasks: TaskInterface[];
};

/**
 * Component for a single task
 * Has the edit and delete option
 * It is a list Item
 */
const SingleEditableTask = ({
  weekId,
  task,
  setTasks,
  tasks,
}: SingleEditableTaskProps): JSX.Element => {
  const authUser = useAuthUser();
  const [editMode, setEditMode] = React.useState(false);
  const [title, setTitle] = React.useState(task.title);
  const [description, setDescription] = React.useState(task.description);

  const handleRemoveClick = async () => {
    //remove
    const payload: DeleteTaskPayloadRequest = {
      weekId: weekId,
      taskId: task._id,
    };
    const [res, err] = await deleteTask(await authUser.getIdToken(), payload, "client");

    if (err !== null) {
      console.error(err);
      if (err instanceof HttpException) {
        toast.error(err.message);
      } else {
        toast.error("Could not remove task. Please try again later.");
      }
      return;
    }
    if (res === null) throw new Error("Shouldn't happen");

    // Update UI
    setTasks([...tasks.filter((t) => t._id !== task._id)]);
    toast.success("Task removed");
  };

  const handleEditClick = async () => {
    // Modal where user can change the description and title

    if (editMode) {
      // Was already in edit mode, need to save changes now
      // Save the text

      const updatedTask: UpdateTaskPayloadRequest = {
        taskId: task._id,
        title: task.title,
        description: task.description,
      };

      const [res, err] = await updateTask(await authUser.getIdToken(), updatedTask, "client");

      if (err !== null) {
        // Error exists
        console.error(err);
        if (err instanceof HttpException) {
          toast.error(err.message);
        } else {
          toast.error("Could not save changes. Please try again later.");
        }
        return;
      }
      if (res === null) throw new Error("Shouldn't happen");
      toast.success("Task changes saved");
    }
    setEditMode(!editMode);
  };

  // Show edit interface
  if (editMode) {
    return (
      <div className="w-full pt-5" data-cy="current-edit">
        <div className="flex flex-col w-full">
          <div className="w-full pb-5">
            <TextField
              id="WeekWorkloadTitle"
              label="Week Workload Title"
              variant="outlined"
              sx={{ maxWidth: "500px" }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <TextField
            id="WorkloadDescription"
            label="Workload Description (Optional)"
            variant="outlined"
            multiline
            rows={5}
            sx={{ maxWidth: "1000px" }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <EditPanelButtons
            editMode={editMode}
            handleEditClick={handleEditClick}
            handleRemoveClick={handleRemoveClick}
          />
        </div>
      </div>
    );
  }

  // Normal task Interface
  return (
    <ListItem
      secondaryAction={
        <IconButton edge="end" aria-label="delete">
          <DeleteIcon />
        </IconButton>
      }
    >
      <ListItemAvatar>
        <ControlPointIcon fontSize="large" />
      </ListItemAvatar>
      <ListItemText primary={title} secondary={description} />
      <div data-cy="edit-button-section">
        <EditPanelButtons
          editMode={editMode}
          handleEditClick={handleEditClick}
          handleRemoveClick={handleRemoveClick}
        />
      </div>
    </ListItem>
  );
};

export default SingleEditableTask;
