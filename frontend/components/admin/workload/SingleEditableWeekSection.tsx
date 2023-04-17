import React, { useEffect } from "react";
import { toast } from "react-toastify";
import { TextField } from "@mui/material";
import Divider from "@mui/material/Divider";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import relativeTimePlugin from "dayjs/plugin/relativeTime";
import utcPlugin from "dayjs/plugin/utc";
import { useAuthUser } from "next-firebase-auth";
import { HttpException } from "util/HttpExceptions";
import {
  DeleteWeekPayloadRequest,
  UpdateWeekPayloadRequest,
  deleteWeek,
  updateWeek,
} from "util/api/workloadApi";
import { OnlineClassInterface } from "models/onlineClass.model";
import { FullWeekInterface } from "models/week.model";
import EditPanelButtons from "../EditPanelButtons";
import TasksSection from "../task/TasksSection";

dayjs.extend(utcPlugin);
dayjs.extend(relativeTimePlugin);

type SingleEditableWeekProps = {
  week: FullWeekInterface;
  setWeeks: React.Dispatch<React.SetStateAction<FullWeekInterface[]>>;
  courseId: string;
  weeks: FullWeekInterface[];
  setWeek?: React.Dispatch<React.SetStateAction<FullWeekInterface | undefined>>;
  onlineClasses: OnlineClassInterface[];
  setOnlineClasses: React.Dispatch<React.SetStateAction<OnlineClassInterface[]>>;
};

/**
 * Component for a single Week.
 * Has an edit option
 */
const SingleEditableWeekSection = ({
  weeks,
  setWeeks,
  courseId,
  week, //corresponds to the current week
  setWeek,
  onlineClasses,
  setOnlineClasses,
}: SingleEditableWeekProps): JSX.Element => {
  const authUser = useAuthUser();

  const [editMode, setEditMode] = React.useState(false);
  const [title, setTitle] = React.useState(week.title);
  const [description, setDescription] = React.useState(week.description);
  const [deadline, setDeadline] = React.useState<Dayjs>(dayjs.utc(week.deadline).local());
  const [tasks, setTasks] = React.useState(week.tasks);

  useEffect(() => {
    setEditMode(false);
    setTitle(week.title);
    setDescription(week.description);
    setDeadline(dayjs.utc(week.deadline).local());
    setTasks(week.tasks);
  }, [weeks, courseId, week, onlineClasses]);

  const handleRemoveClick = async () => {
    // Remove
    const payload: DeleteWeekPayloadRequest = {
      courseId: courseId,
      weekId: week._id,
    };

    const [res, err] = await deleteWeek(await authUser.getIdToken(), payload, "client");

    if (err !== null) {
      console.error(err);
      if (err instanceof HttpException) {
        toast.error(err.message);
      } else {
        toast.error("Could not remove week overview. Please try again later.");
      }
      return;
    }
    if (res === null) throw new Error("Shouldn't happen");

    if (setWeek !== undefined) {
      setWeek(undefined);
    }

    // Update UI
    setWeeks(weeks.filter((w) => w._id !== week._id));
    toast.success("Week removed");
  };

  const handleEditClick = async () => {
    if (editMode) {
      // Was already in edit mode, need to save changes now
      // Save the text

      const updatedWeek: UpdateWeekPayloadRequest = {
        weekId: week._id,
        title: title,
        deadline: deadline.format(),
        description: description,
      };

      const [res, err] = await updateWeek(await authUser.getIdToken(), updatedWeek, "client");

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
      toast.success("Week workload saved");
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
          <LocalizationProvider dateAdapter={AdapterDayjs}>
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
          </LocalizationProvider>
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

  // Show normal interface
  return (
    <div className="p-3">
      <div
        className="w-full py-5 px-10 rounded-lg border-solid border-5 border-[#26a69a;]"
        data-cy={`section-${title}`}
      >
        <div className="w-full items-end">
          <div className="flex-row flex w-full justify-between">
            <div>
              <span className="w-full text-xl font-medium flex flex-col">{title}</span>
              <span className="w-full text-sm flex flex-col">
                <i>Due {dayjs.utc(deadline.format()).endOf("minute").fromNow()}</i>
              </span>
              {/* Description */}
              {description !== undefined && <p>{description}</p>}
              {/* Resource */}
            </div>
            <div data-cy="edit-button-section">
              <EditPanelButtons
                editMode={editMode}
                handleEditClick={handleEditClick}
                handleRemoveClick={handleRemoveClick}
              />
            </div>
          </div>
        </div>
        <Divider />
        <div>
          <TasksSection
            courseId={courseId}
            weekId={week._id}
            tasks={tasks}
            setTasks={setTasks}
            onlineClasses={onlineClasses}
            setOnlineClasses={setOnlineClasses}
          />
        </div>
      </div>
    </div>
  );
};

export default SingleEditableWeekSection;
