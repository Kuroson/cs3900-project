import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button, Checkbox, TextField } from "@mui/material";
import dayjs from "dayjs";
import { QuizInfoType, ResponsesType } from "models/quiz.model";
import { useAuthUser } from "next-firebase-auth";
import PageHeader from "components/common/PageHeader";
import Tag from "components/common/Tag";
import { HttpException } from "util/HttpExceptions";
import { getQuizInfoAfterSubmit, startQuizStudent, submitQuiz } from "util/api/quizApi";
import QuizInfoCard from "./QuizInfoCard";
import ShowAnswer from "./ShowAnswer";

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

const quizAfterSubmit: QuizInfoType = {
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
          // correct: true,
          chosen: true,
        },
        {
          text: "No idea",
          _id: "2",
          chosen: false,
          // correct: true,
        },
      ],
      marks: 10,
      // markAwarded: 5,
      tag: "js",
      text: "What is <a> tag?",
      type: "choice",
      _id: "12",
    },
    {
      type: "open",
      marks: 4,
      // markAwarded: 4,
      tag: "HTML",
      text: "How to use html?",
      _id: "3",
      response: "hi",
    },
  ],
};

const StudentQuiz: React.FC<{
  quizId: string;
  courseId: string;
  handleClose: () => void;
  isResponded: boolean;
  isOpen: boolean;
}> = ({ quizId, courseId, handleClose, isResponded, isOpen }) => {
  const authUser = useAuthUser();
  const [quizInfo, setQuizInfo] = useState<QuizInfoType>({
    title: "",
    open: "",
    close: "",
    maxMarks: 0,
    description: "",
    questions: [],
  });
  const [responses, setResponses] = useState<Array<ResponsesType>>([]);
  const [checkIsResponded, setCheckIsResponded] = useState(isResponded);
  const [checkIsOpen, setCheckIsOpen] = useState<boolean>(isOpen);

  useEffect(() => {
    const startQuiz = async () => {
      const [res, err] = await startQuizStudent(
        await authUser.getIdToken(),
        { quizId: quizId, courseId: courseId },
        "client",
      );
      if (err !== null) {
        console.error(err);
      }

      if (res === null) throw new Error("Response and error are null");
      setQuizInfo(res);
      setResponses(
        res.questions.map((question) => {
          if (question.type === "choice") {
            return { questionId: question._id ?? "", choiceId: [] };
          }
          return { questionId: question._id ?? "", answer: "" };
        }),
      );
    };

    const finishQuiz = async () => {
      const [res, err] = await getQuizInfoAfterSubmit(
        await authUser.getIdToken(),
        { quizId: quizId, courseId: courseId },
        "client",
      );
      if (err !== null) {
        console.error(err);
      }

      if (res === null) throw new Error("Response and error are null");

      setQuizInfo(res);
    };

    if (!checkIsResponded && isOpen) {
      startQuiz();
    } else {
      finishQuiz();
    }
  }, [authUser, courseId, checkIsResponded, quizId, isOpen]);

  const handleSubmit = async () => {
    const [res, err] = await submitQuiz(
      await authUser.getIdToken(),
      {
        quizId: quizId,
        courseId: courseId,
        responses: responses,
      },
      "client",
    );
    if (err !== null) {
      console.error(err);
      if (err instanceof HttpException) {
        toast.error(err.message);
      } else {
        toast.error("Failed to submit quiz");
      }
      return;
    }
    toast.success("Submitted quiz successfully");
    setCheckIsResponded(true);
  };

  return (
    <>
      <PageHeader title={quizInfo.title}>
        <Button variant="outlined" onClick={handleClose}>
          Back
        </Button>
      </PageHeader>
      <div className="mt-7 mx-auto flex flex-col gap-9 w-full max-w-[800px]">
        <QuizInfoCard
          info={{
            title: quizInfo.title,
            description: quizInfo.description,
            maxMarks: quizInfo.maxMarks,
            open: quizInfo.open,
            close: quizInfo.close,
          }}
          isAdmin={false}
        />
        {!checkIsResponded && isOpen ? (
          <>
            {quizInfo.questions &&
              quizInfo.questions.map((question, questionIdx) => (
                <div key={`question_${questionIdx}`}>
                  <div className="flex gap-3 items-center">
                    {question.tag && <Tag text={question.tag} color="bg-[#009688]" />}
                    <Tag text={`Marks: ${String(question.marks)}`} color="bg-[#78909c]" />
                  </div>
                  <p className="text-xl my-2">{question.text}</p>
                  {question.type === "choice" ? (
                    <>
                      {question.choices?.map((choice, choiceIdx) => (
                        <div key={`answer_choice_${choiceIdx}`} className="flex items-center">
                          <Checkbox
                            id={`choice_${choiceIdx}`}
                            onChange={(e) => {
                              setResponses((prev) => {
                                if (e.target.checked) {
                                  prev[questionIdx].choiceId?.push(choice._id ?? "");
                                } else {
                                  prev[questionIdx].choiceId = prev[questionIdx].choiceId?.filter(
                                    (id) => id !== choice._id,
                                  );
                                }
                                return [...prev];
                              });
                            }}
                          />
                          <p className="text-xl">{choice.text}</p>
                        </div>
                      ))}
                    </>
                  ) : (
                    <TextField
                      multiline
                      rows={5}
                      fullWidth
                      variant="outlined"
                      label="Answer"
                      onChange={(e) =>
                        setResponses((prev) => {
                          prev[questionIdx].answer = e.target.value;
                          return [...prev];
                        })
                      }
                    />
                  )}
                </div>
              ))}
          </>
        ) : (
          <>
            {quizInfo.questions &&
              quizInfo.questions.map((question, idx) => (
                <ShowAnswer questionInfo={question} key={`q_answer_${idx}`} isAdmin={false} />
              ))}
          </>
        )}
        <Button variant="contained" disabled={checkIsResponded} onClick={handleSubmit}>
          Submit
        </Button>
      </div>
    </>
  );
};

export default StudentQuiz;
