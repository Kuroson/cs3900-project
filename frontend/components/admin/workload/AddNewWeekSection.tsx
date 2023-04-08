import React from "react";
import { toast } from "react-toastify";
import { Box, Button, TextField } from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { FullWeekInterface, WeekInterface } from "models/week.model";
import { useAuthUser } from "next-firebase-auth";
import { HttpException } from "util/HttpExceptions";
import { createNewWeek } from "util/api/workloadApi";

type AddNewWeekSectionProps = {
  courseId: string;
  pageId: string;
  setWeeks: React.Dispatch<React.SetStateAction<FullWeekInterface[]>>;
  weeks: FullWeekInterface[];
  setWeek: React.Dispatch<React.SetStateAction<FullWeekInterface | undefined>>;
};

const AddNewWorkloadSection = ({
  courseId,
  pageId,
  setWeeks,
  weeks,
  setWeek,
}: AddNewWeekSectionProps): JSX.Element => {
  const authUser = useAuthUser();

  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [deadline, setDeadline] = React.useState<Dayjs>(dayjs().add(1, "day"));

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
      pageId,
      title,
      description,
      deadline.format(),
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
    setWeek(weekToAdd);
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
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
            <div>
              <div className="w-full pb-5">
                <DateTimePicker
                  views={["year", "month", "day", "hours", "minutes"]}
                  sx={{ width: "100%", maxWidth: "300px" }}
                  value={deadline}
                  onChange={(value) => {
                    if (value) {
                      setDeadline(value);
                    }
                  }}
                />
              </div>
            </div>
          </LocalizationProvider>
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
