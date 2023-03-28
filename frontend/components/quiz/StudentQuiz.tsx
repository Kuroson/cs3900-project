import React from "react";
import { Button } from "@mui/material";
import dayjs from "dayjs";
import { QuizInfoType } from "models/quiz.model";
import PageHeader from "components/common/PageHeader";

const quizBeforeSubmit: QuizInfoType = {
  title: "Quiz1",
  open: dayjs().format(),
  close: dayjs().add(30, "minute").format(),
  maxMarks: 100,
  description: "This quiz aims for student getting familiar with HTML",
  questions: [
    {
      choices: [
        {
          text: "I dont know",
          _id: "1",
        },
        {
          text: "No idea",
          _id: "2",
        },
      ],
      marks: 10,
      tag: "js",
      text: "What is <a> tag?",
      type: "choice",
      _id: "12",
    },
    {
      type: "open",
      marks: 4,
      tag: "HTML",
      text: "How to use html?",
      _id: "3",
    },
  ],
};

const StudentQuiz: React.FC<{
  quizId: string;
  courseId: string;
  handleClose: () => void;
  isResponded: boolean;
}> = ({ quizId, courseId, handleClose, isResponded }) => {
  return (
    <>
      <PageHeader title="Quiz">
        <Button variant="outlined" onClick={handleClose}>
          Back
        </Button>
      </PageHeader>
    </>
  );
};

export default StudentQuiz;
