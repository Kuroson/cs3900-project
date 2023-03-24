import React, { useState } from "react";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { Button, TextField } from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { CreateQuizType, QuizType } from "models/quiz.model";
import TitleWithIcon from "components/common/TitleWithIcon";
import { createNewQuiz } from "util/api/quizApi";

const AddNewQuiz: React.FC<{
  handleAddNewQuiz: (newQuiz: CreateQuizType) => void;
  closeQuiz: () => void;
  courseId: string;
}> = ({ handleAddNewQuiz, closeQuiz, courseId }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [maxMarks, setMaxMarks] = useState(0);
  const [openTime, setOpenTime] = useState<Dayjs>(dayjs());
  // console.log("🚀 ~ file: ShowQuizzes.tsx:81 ~ openTime:", typeof openTime?.format());
  const [closeTime, setCloseTime] = useState<Dayjs>(dayjs().add(1, "day"));

  const addNewQuiz = async () => {
    const newQuiz: CreateQuizType = {
      courseId: courseId,
      title: title,
      description: description,
      maxMarks: maxMarks,
      open: openTime.format(),
      close: closeTime.format(),
    };
    handleAddNewQuiz(newQuiz);
  };

  return (
    <>
      <h1 className="text-3xl w-full border-solid border-t-0 border-x-0 border-[#EEEEEE] flex justify-between pt-3">
        <div className="flex items-center gap-4">
          <span className="ml-4">Add New Quiz</span>
        </div>
      </h1>
      <div className="mt-7 mx-auto flex flex-col gap-9 w-full max-w-[800px]">
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
        <div className="flex gap-2 max-w-[800px] justify-end">
          <Button variant="outlined" onClick={closeQuiz}>
            Cancel
          </Button>
          <Button variant="contained" disabled={!title} onClick={addNewQuiz}>
            Add Quiz
          </Button>
        </div>
      </div>
    </>
  );
};

export default AddNewQuiz;
