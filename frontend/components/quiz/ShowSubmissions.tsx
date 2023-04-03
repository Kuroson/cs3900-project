import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Button, Card, TextField } from "@mui/material";
import { EachQuestionSubmissionsType, QuizSubmissionsType } from "models/quiz.model";
import { useAuthUser } from "next-firebase-auth";
import Tag from "components/common/Tag";
import { HttpException } from "util/HttpExceptions";
import { getQuizSubmissions, gradeSubmission } from "util/api/quizApi";

type MarkProps = {
  courseId: string;
  quizId: string;
};

type SubmissionsProps = {
  submissions: EachQuestionSubmissionsType;
};

const Submissions = ({ submissions }: SubmissionsProps): JSX.Element => {
  const [showSubmission, setShowSubmission] = useState(false);
  const [marks, setMarks] = useState<number>();
  const authUser = useAuthUser();
  const handleMarkAnswer = async (responseId: string) => {
    const [res, err] = await gradeSubmission(
      await authUser.getIdToken(),
      {
        questionId: submissions.question.questionId,
        responseId: responseId,
        mark: marks ?? 0,
      },
      "client",
    );
    if (err !== null) {
      console.error(err);
      if (err instanceof HttpException) {
        toast.error(err.message);
      } else {
        toast.error("Failed to mark answer");
      }
      return;
    }
    toast.success("Marked answer successfully");
  };

  return (
    <div>
      <div className="flex gap-3 items-center">
        {submissions.question.tag && <Tag text={submissions.question.tag} color="bg-[#009688]" />}
        <Tag text={`Marks: ${submissions.question.marks}`} color="bg-[#78909c]" />
      </div>
      <p className="text-xl my-2">{submissions.question.text}</p>
      <Button
        startIcon={showSubmission ? <VisibilityOffIcon /> : <VisibilityIcon />}
        onClick={() => setShowSubmission((prev) => !prev)}
      >
        {showSubmission ? "Hide submissions" : "Show submissions"}
      </Button>
      {showSubmission && (
        <div className="flex flex-col gap-2 p-3">
          {submissions.responses.map((response, idx) => (
            <Card key={`response_${idx}`} className="p-4 flex flex-col gap-3">
              <p>{response.answer}</p>
              <div className="flex items-center gap-3">
                <TextField
                  id={`marking_${idx}`}
                  label="Marks"
                  variant="standard"
                  type="number"
                  onChange={(e) => setMarks(+e.target.value)}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleMarkAnswer(response.responseId)}
                >
                  Send
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const sample: QuizSubmissionsType = {
  submissions: [
    {
      question: {
        questionId: "1",
        text: "what is html? Explan it",
        marks: "10",
        tag: "html",
      },
      responses: [
        {
          responseId: "1",
          studentId: "1",
          answer: "answer here",
        },
        {
          responseId: "2",
          studentId: "2",
          answer: "answer2 here",
        },
        {
          responseId: "3",
          studentId: "3",
          answer: "answer2 here",
        },
      ],
    },
  ],
};

const ShowSubmissions = ({ courseId, quizId }: MarkProps): JSX.Element => {
  const [questions, setQuestions] = useState(sample["submissions"]);
  const authUser = useAuthUser();

  useEffect(() => {
    const getSubmissions = async () => {
      const [res, err] = await getQuizSubmissions(
        await authUser.getIdToken(),
        {
          quizId: quizId,
          courseId: courseId,
        },
        "client",
      );
      if (err !== null) {
        console.error(err);
        if (err instanceof HttpException) {
          toast.error(err.message);
        } else {
          toast.error("Failed to fetch submissions");
        }
        return;
      }
      if (res !== null) {
        setQuestions(res["submissions"]);
      }
    };
    // getSubmissions();
  }, [authUser, courseId, quizId]);

  return (
    <div>
      {questions.map((question, idx) => (
        <Submissions submissions={question} key={`mark_${idx}`} />
      ))}
    </div>
  );
};

export default ShowSubmissions;
