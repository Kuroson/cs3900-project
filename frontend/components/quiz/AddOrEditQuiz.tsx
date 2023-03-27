import React, { useState } from "react";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { Box, Button, TextField } from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { CreateQuizType, QuizBasicInfo } from "models/quiz.model";
import PageHeader from "components/common/PageHeader";
import TitleWithIcon from "components/common/TitleWithIcon";
import styles from "./EditQuiz.module.scss";

// Add or edit quiz info for admin
const AddOrEditQuiz: React.FC<{
  handleAddNewQuiz?: (newQuiz: CreateQuizType) => void;
  closeQuiz: () => void;
  courseId?: string;
  info?: QuizBasicInfo;
  isEditing: boolean;
  handleEditInfo?: (newInfo: QuizBasicInfo) => void;
}> = ({ handleAddNewQuiz, closeQuiz, courseId, info, isEditing, handleEditInfo }) => {
  const [title, setTitle] = useState(info?.title ?? "");
  const [description, setDescription] = useState(info?.description ?? "");
  const [maxMarks, setMaxMarks] = useState(info?.maxMarks ?? 0);
  const [openTime, setOpenTime] = useState<Dayjs>(
    info?.open != null ? dayjs.utc(info.open).local() : dayjs(),
  );
  const [closeTime, setCloseTime] = useState<Dayjs>(
    info?.close != null ? dayjs.utc(info.close).local() : dayjs().add(1, "day"),
  );

  const addNewQuiz = () => {
    const newQuiz: CreateQuizType = {
      courseId: courseId ?? "",
      title: title,
      description: description,
      maxMarks: maxMarks,
      open: openTime.format(),
      close: closeTime.format(),
    };
    if (handleAddNewQuiz) {
      handleAddNewQuiz(newQuiz);
    }
  };

  return (
    <>
      <PageHeader title={isEditing ? "Edit Quiz" : "Add New Quiz"} />
      <Box
        sx={{
          margin: "auto",
          marginTop: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          width: "100%",
          maxWidth: "800px",
        }}
      >
        <TextField
          id="quiz name"
          variant="outlined"
          label="Quiz Title"
          sx={{ width: "100%", maxWidth: "800px" }}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField
          id="quiz description"
          variant="outlined"
          label="Quiz Description"
          sx={{ width: "100%", maxWidth: "800px" }}
          multiline
          rows={7}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <TextField
          id="max mark"
          label="Max Mark"
          type="number"
          variant="outlined"
          sx={{ width: "100%", maxWidth: "800px" }}
          value={maxMarks}
          onChange={(e) => setMaxMarks(+e.target.value)}
        />
        {/* timing */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <div>
            <TitleWithIcon text="Timing">
              <AccessTimeIcon color="primary" />
            </TitleWithIcon>
            <div className="flex gap-9 mt-6 items-center">
              <h3>Open the quiz</h3>
              <DateTimePicker
                views={["year", "month", "day", "hours", "minutes"]}
                sx={{ width: "100%", maxWidth: "300px" }}
                value={openTime}
                onChange={(value) => {
                  if (value) {
                    setOpenTime(value);
                  }
                }}
              />
            </div>
            <div className="flex gap-9 mt-6 items-center">
              <h3>Close the quiz</h3>
              <DateTimePicker
                views={["year", "month", "day", "hours", "minutes"]}
                sx={{ width: "100%", maxWidth: "300px" }}
                value={closeTime}
                onChange={(value) => {
                  if (value) {
                    setCloseTime(value);
                  }
                }}
              />
            </div>
          </div>
        </LocalizationProvider>
        <Box sx={{ display: "flex", gap: "10px", maxWidth: "800px", justifyContent: "end" }}>
          <Button variant="outlined" onClick={closeQuiz}>
            Cancel
          </Button>
          {!isEditing ? (
            <Button variant="contained" disabled={!title} onClick={addNewQuiz}>
              Add Quiz
            </Button>
          ) : (
            <Button
              variant="contained"
              disabled={!title}
              onClick={() => {
                if (!handleEditInfo) return;
                handleEditInfo({
                  title: title,
                  open: openTime.format(),
                  close: closeTime.format(),
                  description: description,
                  maxMarks: maxMarks,
                });
                closeQuiz();
              }}
            >
              Edit Quiz
            </Button>
          )}
        </Box>
      </Box>
    </>
  );
};

export default AddOrEditQuiz;
