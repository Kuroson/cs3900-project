import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Avatar, Button, Card, TextField } from "@mui/material";
import { useAuthUser } from "next-firebase-auth";
import Tag from "components/common/Tag";
import { HttpException } from "util/HttpExceptions";
import { getQuizSubmissions, gradeSubmission } from "util/api/quizApi";
import { EachQuestionSubmissionsType, StudentResponseType } from "models/quiz.model";

type MarkProps = {
  courseId: string;
  quizId: string;
};

type SubmissionsProps = {
  submissions: EachQuestionSubmissionsType;
};

type AnswerProps = {
  response: StudentResponseType;
  handleMarkAnswer: (responseId: string, marks: number) => Promise<void>;
};

const ShowSubmissions = ({ courseId, quizId }: MarkProps): JSX.Element => {
  const [questions, setQuestions] = useState<EachQuestionSubmissionsType[]>();
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
    getSubmissions();
  }, [authUser, courseId, quizId]);

  return (
    <div className="flex flex-col gap-8">
      {questions?.map((question, idx) => (
        <Submissions submissions={question} key={`mark_${idx}`} />
      ))}
    </div>
  );
};

const Submissions = ({ submissions }: SubmissionsProps): JSX.Element => {
  const [showSubmission, setShowSubmission] = useState(false);
  const authUser = useAuthUser();

  const handleMarkAnswer = async (responseId: string, marks: number) => {
    const [res, err] = await gradeSubmission(
      await authUser.getIdToken(),
      {
        questionId: submissions.question.questionId,
        responseId: responseId,
        mark: marks,
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
        <div className="flex flex-col gap-3 p-3">
          {submissions.responses.map((response, idx) => (
            <Answer
              response={response}
              key={`response_${idx}`}
              handleMarkAnswer={handleMarkAnswer}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// each student answer
const Answer = ({ response, handleMarkAnswer }: AnswerProps): JSX.Element => {
  const [marks, setMarks] = useState<number>();
  const getNameInitial = response.studentName.split(" ");

  return (
    <Card className="p-4 flex flex-col gap-3">
      <div className="flex gap-3 items-center">
        <Avatar src={response.studentAvatar}>
          {getNameInitial[0][0]}
          {getNameInitial[1][0]}
        </Avatar>
        <h3>{response.studentName}</h3>
      </div>
      <p>{response.answer}</p>
      <div className="flex items-center gap-3">
        <TextField
          label="Marks"
          variant="standard"
          type="number"
          onChange={(e) => setMarks(+e.target.value)}
        />
        <Button
          variant="contained"
          size="small"
          onClick={() => handleMarkAnswer(response.responseId, marks ?? 0)}
        >
          Send
        </Button>
      </div>
    </Card>
  );
};

export default ShowSubmissions;
