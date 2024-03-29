import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button, Checkbox, TextField } from "@mui/material";
import { useAuthUser } from "next-firebase-auth";
import PageHeader from "components/common/PageHeader";
import Tag from "components/common/Tag";
import { HttpException } from "util/HttpExceptions";
import { getQuizInfoAfterSubmit, startQuizStudent, submitQuiz } from "util/api/quizApi";
import { QuizInfoType, ResponsesType } from "models/quiz.model";
import QuizInfoCard from "./QuizInfoCard";
import ShowAnswer from "./ShowAnswer";

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
            markAwarded: quizInfo.marksAwarded,
          }}
          isAdmin={false}
        />
        {!checkIsResponded && isOpen ? (
          <>
            {quizInfo.questions.map((question, questionIdx) => (
              <div key={`question_${questionIdx}`}>
                <div className="flex gap-3 items-center">
                  {question.tag && <Tag text={question.tag} color="bg-[#009688]" />}
                  <Tag text={`Marks: ${String(question.marks)}`} color="bg-[#78909c]" />
                </div>
                <p className="text-xl my-2">{question.text}</p>
                {question.type === "choice" ? (
                  <>
                    {question.choices?.map((choice, choiceIdx) => (
                      <AnswerChoice
                        key={`answer_choice_${choiceIdx}`}
                        choice={choice}
                        questionIdx={questionIdx}
                        setResponses={setResponses}
                      />
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
            {quizInfo?.questions?.map((question, idx) => (
              <ShowAnswer questionInfo={question} key={`q_answer_${idx}`} isAdmin={false} />
            ))}
          </>
        )}
        <Button variant="contained" disabled={checkIsResponded || !isOpen} onClick={handleSubmit}>
          Submit
        </Button>
      </div>
    </>
  );
};

type AnswerChoiceProps = {
  choice: {
    _id?: string | undefined;
    text: string;
    correct?: boolean | undefined;
    chosen?: boolean | undefined;
  };
  setResponses: React.Dispatch<React.SetStateAction<ResponsesType[]>>;
  questionIdx: number;
};

const AnswerChoice = ({ choice, setResponses, questionIdx }: AnswerChoiceProps): JSX.Element => {
  return (
    <div className="flex items-center">
      <Checkbox
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
  );
};

export default StudentQuiz;
