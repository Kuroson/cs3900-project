import React from "react";
import { toast } from "react-toastify";
import AddIcon from "@mui/icons-material/Add";
import {
  Avatar,
  Button,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  TextField,
} from "@mui/material";
import { TaskInterface } from "models/task.model";
import { useAuthUser } from "next-firebase-auth";
import { HttpException } from "util/HttpExceptions";
import { createNewTask } from "util/api/workloadApi";

type AddNewTaskSectionProps = {
  weekId: string;
  setTasks: React.Dispatch<React.SetStateAction<TaskInterface[]>>;
  tasks: TaskInterface[];
};

const AddNewTaskSection = ({ weekId, setTasks, tasks }: AddNewTaskSectionProps): JSX.Element => {
  const authUser = useAuthUser();

  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");

  const handleCloseForm = () => {
    setOpen(false);
    setTitle("");
    setDescription("");
  };

  React.useEffect(() => {
    setOpen(false);
  }, [weekId]);

  const handleNewTask = async () => {
    // Create New Task
    const [res, err] = await createNewTask(
      await authUser.getIdToken(),
      weekId,
      title,
      description,
      "client",
    );

    if (err !== null) {
      console.error(err);
      if (err instanceof HttpException) {
        toast.error(err.message);
      } else {
        toast.error("Failed to create new task");
      }
      return;
    }
    if (res === null) throw new Error("Shouldn't happen");
    toast.success("New task added");

    // Append new Task now
    const taskToAdd: TaskInterface = {
      _id: res.taskId,
      title: title,
      description: description,
    };

    setTasks([...tasks, taskToAdd]);
    handleCloseForm();
  };

  if (open) {
    return (
      <div className="w-full pt-4">
        <div className="flex flex-col w-full">
          <div className="w-full pb-5">
            <TextField
              id="TaskTitle"
              label="Task Title"
              variant="outlined"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-[300px] max-w-[500px]"
            />
          </div>
          <div className="w-full pb-5">
            <TextField
              id="TaskDescription"
              label="Task Description (Optional)"
              variant="outlined"
              multiline
              rows={5}
              sx={{ maxWidth: "1000px" }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="pt-4 w-full flex justify-between">
            <div className="flex gap-2">
              <Button variant="outlined" color="error" onClick={handleCloseForm}>
                Cancel
              </Button>
              <Button
                id="createTaskButton"
                variant="contained"
                onClick={handleNewTask}
                disabled={title === ""}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ListItem disableGutters>
      <ListItemButton autoFocus onClick={() => setOpen(true)}>
        <ListItemAvatar>
          <Avatar>
            <AddIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary="Add New Task" />
      </ListItemButton>
    </ListItem>
    // <div className="mt-4">
    //   <Button variant="contained" onClick={() => setOpen(true)}>
    //     Add New Task
    //   </Button>
    // </div>
  );
};

export default AddNewTaskSection;
