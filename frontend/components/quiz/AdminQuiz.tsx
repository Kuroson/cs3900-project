import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button, Divider } from "@mui/material";
import dayjs from "dayjs";
import { useAuthUser } from "next-firebase-auth";
import PageHeader from "components/common/PageHeader";
import { HttpException } from "util/HttpExceptions";
import {
  createNewQuestion,
  deleteQuestion,
  getQuizInfoAdmin,
  updateQuizAdmin,
} from "util/api/quizApi";
import { QuizBasicInfo, QuizInfoType, QuizQuestionType } from "models/quiz.model";
import AddQuestionModal from "./AddQuestionModal";
import QuizInfoCard from "./QuizInfoCard";
import ShowAnswer from "./ShowAnswer";
import ShowSubmissions from "./ShowSubmissions";

type AdminQuizProps = {
  quizId: string;
  handleClose: () => void;
  courseId: string;
  courseTags: Array<string>;
};

const AdminQuiz: React.FC<AdminQuizProps> = ({
  quizId,
  handleClose,
  courseId,
  courseTags,
}): JSX.Element => {
  const authUser = useAuthUser();
  const [quizInfo, setQuizInfo] = useState<QuizInfoType>({
    title: "",
    open: "",
    close: "",
    maxMarks: 0,
    description: "",
    questions: [],
  });
  // add question
  const [addQuestionModal, setAddQuestionModal] = useState(false);
  const [markQuestion, setMarkQuestion] = useState(false);
  const isBeforeOpen = dayjs.utc() < dayjs.utc(quizInfo.open);
  const isClosed = dayjs.utc() > dayjs.utc(quizInfo.close);

  useEffect(() => {
    const getQuizInfo = async () => {
      const [res, err] = await getQuizInfoAdmin(await authUser.getIdToken(), quizId, "client");
      if (err !== null) {
        console.error(err);
      }

      if (res === null) throw new Error("Response and error are null");
      setQuizInfo(res);
    };
    getQuizInfo();
  }, [authUser, quizId]);

  const canEditQuiz = () => {
    // Can only edit quiz before opening
    const isOpen = new Date() > new Date(Date.parse(quizInfo.open));

    if (isOpen) {
      toast.error("Can only edit quiz before opening");
    }
    return !isOpen;
  };

  // edit quiz info
  const handleEditInfo = async (newInfo: QuizBasicInfo) => {
    if (!canEditQuiz()) return;

    const [res, err] = await updateQuizAdmin(
      await authUser.getIdToken(),
      { ...newInfo, quizId: quizId },
      "client",
    );
    if (err !== null) {
      console.error(err);
      if (err instanceof HttpException) {
        toast.error(err.message);
      } else {
        toast.error("Failed to edit quiz");
      }
      return;
    }
    if (res === null) throw new Error("Shouldn't happen");
    toast.success("Edited quiz successfully");

    setQuizInfo((prev) => ({
      questions: prev?.questions ?? [],
      title: newInfo.title,
      open: newInfo.open,
      close: newInfo.close,
      description: newInfo.description,
      maxMarks: newInfo.maxMarks,
    }));
  };

  const handleAddQuestion = async (newQuestion: QuizQuestionType, clearForm: () => void) => {
    if (!canEditQuiz()) {
      setAddQuestionModal((prev) => !prev);
      return;
    }

    const [res, err] = await createNewQuestion(
      await authUser.getIdToken(),
      {
        courseId: courseId,
        quizId: quizId,
        ...newQuestion,
      },
      "client",
    );
    if (err !== null) {
      console.error(err);
      if (err instanceof HttpException) {
        toast.error(err.message);
      } else {
        toast.error("Failed to add question in the quiz");
      }
      return;
    }
    if (res === null) throw new Error("Shouldn't happen");
    toast.success("Added question in quiz successfully");

    setQuizInfo((prev) => ({
      ...prev,
      questions: [...(prev?.questions ?? []), { ...newQuestion, _id: res.questionId }],
    }));

    setAddQuestionModal((prev) => !prev);
    clearForm();
  };

  const handleDeleteQuestion = async (questionId: string, idx: number) => {
    if (!canEditQuiz()) return;

    const [res, err] = await deleteQuestion(
      await authUser.getIdToken(),
      {
        quizId: quizId,
        questionId: questionId,
      },
      "client",
    );
    if (err !== null) {
      console.error(err);
      if (err instanceof HttpException) {
        toast.error(err.message);
      } else {
        toast.error("Failed to delete question");
      }
      return;
    }
    toast.success("Deleted question successfully");

    setQuizInfo((prev) => {
      prev.questions.splice(idx, 1);
      return { ...prev };
    });
  };

  return (
    <>
      <PageHeader title={quizInfo?.title ?? ""}>
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
          isAdmin={true}
          handleEditInfo={handleEditInfo}
        />
        {isClosed && (
          <div className="flex justify-center items-center gap-2">
            <Button onClick={() => setMarkQuestion(false)}>Show all questions</Button>
            <Divider orientation="vertical" sx={{ height: "20px" }} />
            <Button onClick={() => setMarkQuestion(true)}>Mark Open Questions</Button>
          </div>
        )}
        {markQuestion ? (
          <ShowSubmissions courseId={courseId} quizId={quizId} />
        ) : (
          quizInfo.questions.map((question, idx) => (
            <ShowAnswer
              key={`answer+${idx}`}
              questionInfo={question}
              isAdmin={true}
              handleDelete={() => handleDeleteQuestion(question._id ?? "", idx)}
              isBeforeOpen={isBeforeOpen}
            />
          ))
        )}
        {isBeforeOpen && (
          <Button onClick={() => setAddQuestionModal((prev) => !prev)} variant="outlined">
            Add Question
          </Button>
        )}
        <AddQuestionModal
          open={addQuestionModal}
          setOpen={setAddQuestionModal}
          courseTags={courseTags}
          handleAddQuestion={handleAddQuestion}
        />
      </div>
    </>
  );
};

export default AdminQuiz;
