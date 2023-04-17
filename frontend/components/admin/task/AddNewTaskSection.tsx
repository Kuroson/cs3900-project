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
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import { useAuthUser } from "next-firebase-auth";
import { HttpException } from "util/HttpExceptions";
import { CreateNewTaskPayloadRequest, createNewTask } from "util/api/workloadApi";
import { OnlineClassInterface } from "models/onlineClass.model";
import { TaskInterface } from "models/task.model";
import TaskTypeSelector from "./TaskTypeSelector";

type AddNewTaskSectionProps = {
  courseId: string;
  weekId: string;
  setTasks: React.Dispatch<React.SetStateAction<TaskInterface[]>>;
  tasks: TaskInterface[];
  onlineClasses: OnlineClassInterface[];
  setOnlineClasses: React.Dispatch<React.SetStateAction<OnlineClassInterface[]>>;
};

const AddNewTaskSection = ({
  courseId,
  weekId,
  setTasks,
  tasks,
  onlineClasses,
  setOnlineClasses,
}: AddNewTaskSectionProps): JSX.Element => {
  const authUser = useAuthUser();

  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [taskType, setTaskType] = React.useState("none");
  const [quiz, setQuiz] = React.useState<string | undefined>(undefined);
  const [assignment, setAssignment] = React.useState<string | undefined>(undefined);
  const [onlineClass, setOnlineClass] = React.useState<string | undefined>(undefined);

  const handleTaskTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTaskType((event.target as HTMLInputElement).value);
  };

  const handleCloseForm = () => {
    setOpen(false);
    setTitle("");
    setDescription("");
  };

  React.useEffect(() => {
    setOpen(false);
  }, [weekId]);

  // Handle for different task types
  const payload: CreateNewTaskPayloadRequest = {
    courseId: courseId,
    weekId: weekId,
    title: title,
    description: description,
    quizId: quiz,
    assignmentId: assignment,
    onlineClassId: onlineClass,
  };

  const handleNewTask = async () => {
    // Create New Task
    const [res, err] = await createNewTask(await authUser.getIdToken(), payload, "client");

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
      quiz: quiz,
      assignment: assignment,
      onlineClass: onlineClass,
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
          <FormControl>
            <FormLabel id="task-content-radio-group">Task Content</FormLabel>
            <RadioGroup row value={taskType} onChange={handleTaskTypeChange}>
              <FormControlLabel value="quiz" control={<Radio />} label="Quiz" />
              <FormControlLabel value="assignment" control={<Radio />} label="Assignment" />
              <FormControlLabel value="onlineclass" control={<Radio />} label="Online Class" />
              <FormControlLabel value="none" control={<Radio />} label="None" />
            </RadioGroup>
          </FormControl>
          <TaskTypeSelector
            courseId={courseId}
            taskType={taskType}
            onlineClasses={onlineClasses}
            quiz={quiz}
            setQuiz={setQuiz}
            assignment={assignment}
            setAssignment={setAssignment}
            onlineClass={onlineClass}
            setOnlineClass={setOnlineClass}
          />
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
            <AddIcon fontSize="small" />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary="Add New Task" />
      </ListItemButton>
    </ListItem>
  );
};

export default AddNewTaskSection;
