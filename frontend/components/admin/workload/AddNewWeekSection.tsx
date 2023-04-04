import React from "react";
import { toast } from "react-toastify";
import { Button, TextField } from "@mui/material";
import { FullWeekInterface, WeekInterface } from "models/week.model";
import { useAuthUser } from "next-firebase-auth";
import { HttpException } from "util/HttpExceptions";
import { createNewWeek } from "util/api/workloadApi";

type AddNewWeekSectionProps = {
  courseId: string;
  setWeeks: React.Dispatch<React.SetStateAction<FullWeekInterface[]>>;
  weeks: FullWeekInterface[];
};

const AddNewWorkloadSection = ({
  courseId,
  setWeeks,
  weeks,
}: AddNewWeekSectionProps): JSX.Element => {
  const authUser = useAuthUser();

  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any

  const handleCloseForm = () => {
    setOpen(false);
    setTitle("");
    setDescription("");
  };

  React.useEffect(() => {
    setOpen(false);
  }, [courseId]);

  const handleNewWeek = async () => {
    // Create the new week
    const [res, err] = await createNewWeek(
      await authUser.getIdToken(),
      courseId,
      title,
      description,
      "client",
    );

    if (err !== null) {
      console.error(err);
      if (err instanceof HttpException) {
        toast.error(err.message);
      } else {
        toast.error("Failed to create new Weekly Workload Overview");
      }
      return;
    }
    if (res === null) throw new Error("Shouldn't happen");
    toast.success("New weekly workload added");

    // Append new Week now
    const weekToAdd: FullWeekInterface = {
      _id: res.weekId,
      title: title,
      description: description,
      tasks: [],
    };

    setWeeks([...weeks, weekToAdd]);

    handleCloseForm();
  };

  if (open) {
    return (
      <div className="w-full pt-4">
        <div className="flex flex-col w-full">
          <div className="w-full pb-5">
            <TextField
              id="WorkloadTitle"
              label="Workload List Title"
              variant="outlined"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-[300px] max-w-[500px]"
            />
          </div>
          <div className="w-full pb-5">
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
          <div className="pt-4 w-full flex justify-between">
            <div className="flex gap-2">
              <Button variant="outlined" color="error" onClick={handleCloseForm}>
                Cancel
              </Button>
              <Button
                id="createWeekeButton"
                variant="contained"
                onClick={handleNewWeek}
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
    <div className="mt-4">
      <Button variant="contained" onClick={() => setOpen(true)}>
        Add New Workload
      </Button>
    </div>
  );
};

export default AddNewWorkloadSection;
