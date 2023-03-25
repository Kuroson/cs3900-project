import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import dayjs from "dayjs";
import { QuizBasicInfo, QuizInfoTypeAdmin } from "models/quiz.model";
import { useAuthUser } from "next-firebase-auth";
import PageHeader from "components/common/PageHeader";
import { getQuizInfoAdmin } from "util/api/quizApi";
import QuizInfoCard from "./QuizInfoCard";

const quiz: QuizInfoTypeAdmin = {
  title: "Quiz1",
  open: dayjs().format(),
  close: dayjs().add(30, "minute").format(),
  maxMarks: 100,
  description: "This quiz aims for student getting familiar with HTML",
  questions: [],
};

const AdminQuiz: React.FC<{ quizId: string; handleClose: () => void }> = ({
  quizId,
  handleClose,
}) => {
  const [quizInfo, setquizInfo] = useState<QuizInfoTypeAdmin>();
  const authUser = useAuthUser();

  useEffect(() => {
    const getQuizInfo = async () => {
      const [res, err] = await getQuizInfoAdmin(await authUser.getIdToken(), quizId, "client");
      if (err !== null) {
        console.error(err);
      }

      if (res === null) throw new Error("Response and error are null");
      setquizInfo(res);
    };
    setquizInfo(quiz);
    // TODO
    // getQuizInfo()
  }, [authUser, quizId]);

  // edit quiz info
  const handleEditInfo = (newInfo: QuizBasicInfo) => {
    setquizInfo((prev) => ({
      questions: prev?.questions ?? [],
      title: newInfo.title,
      open: newInfo.open,
      close: newInfo.close,
      description: newInfo.description,
      maxMarks: newInfo.maxMarks,
    }));
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
            title: quizInfo?.title ?? "",
            description: quizInfo?.description ?? "",
            maxMarks: quizInfo?.maxMarks ?? 0,
            open: quizInfo?.open ?? "",
            close: quizInfo?.close ?? "",
          }}
          isAdmin={true}
          handleEditInfo={handleEditInfo}
        />
      </div>
    </>
  );
};

export default AdminQuiz;
