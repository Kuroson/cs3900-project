/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Head from "next/head";
import AddIcon from "@mui/icons-material/Add";
import dayjs from "dayjs";
import { UserCourseInformation } from "models/course.model";
import { CreateQuizType, QuizListType } from "models/quiz.model";
import { UserDetails } from "models/user.model";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { AdminNavBar, ContentContainer, Loading } from "components";
import Card from "components/common/Card";
import PageHeader from "components/common/PageHeader";
import AddOrEditQuiz from "components/quiz/AddOrEditQuiz";
import AdminQuiz from "components/quiz/AdminQuiz";
import { HttpException } from "util/HttpExceptions";
import { useUser } from "util/UserContext";
import { getUserCourseDetails } from "util/api/courseApi";
import { createNewQuiz, getListOfQuizzes } from "util/api/quizApi";
import initAuth from "util/firebase";

initAuth(); // SSR maybe, i think...

type QuizProps = {
  courseData: UserCourseInformation;
};

const quizzes: QuizListType[] = [
  {
    quizId: "1",
    title: "Quiz1",
    open: dayjs().format(),
    close: dayjs().add(30, "minute").format(),
  },
  {
    quizId: "2",
    title: "Quiz2",
    open: dayjs().format(),
    close: dayjs().subtract(1, "day").format(),
  },
];

const Quiz = ({ courseData }: QuizProps): JSX.Element => {
  // TODO: Fix metadata thing
  const user = useUser();
  const authUser = useAuthUser();
  const [loading, setLoading] = React.useState(user.userDetails === null);
  const [quizList, setQuizList] = useState<QuizListType[]>(quizzes);
  const [addNewQuiz, setAddNewQuiz] = useState(false);
  const [openQuiz, setOpenQuiz] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState("");

  const handleAddNewQuiz = async (newQuiz: CreateQuizType) => {
    // TODO: backend
    // const [res, err] = await createNewQuiz(await authUser.getIdToken(), newQuiz, "client");
    // if (err !== null) {
    //   console.error(err);
    //   if (err instanceof HttpException) {
    //     toast.error(err.message);
    //   } else {
    //     toast.error(err);
    //   }
    //   return;
    // }
    // if (res === null) throw new Error("Response and error are null");

    const quiz = {
      quizId: "3", // res.quizId
      title: newQuiz.title,
      open: newQuiz.open,
      close: newQuiz.close,
    };

    setQuizList((prev) => [...prev, quiz]);
    setAddNewQuiz(false);
    toast.success("Quiz created successfully");
  };

  useEffect(() => {
    // TODO
    const getQuizzes = async () => {
      const [res, err] = await getListOfQuizzes(
        await authUser.getIdToken(),
        courseData._id,
        "client",
      );
      if (err !== null) {
        console.error(err);
        if (err instanceof HttpException) {
          toast.error(err.message);
        } else {
          toast.error(err);
        }
        return;
      }
      if (res === null) throw new Error("Response and error are null");
      setQuizList(res.quizzes);
    };
    // getQuizzes();
  }, [authUser, courseData._id]);

  useEffect(() => {
    // Build user data for user context
    if (user.userDetails !== null) {
      setLoading(false);
    }
  }, [user.userDetails]);

  if (loading || user.userDetails === null) return <Loading />;
  const userDetails = user.userDetails as UserDetails;

  return (
    <>
      <Head>
        <title>Quiz</title>
        <meta name="description" content="Quiz" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <AdminNavBar userDetails={userDetails} courseData={courseData} showAddPage={true} />
      <ContentContainer>
        <div className="flex flex-col w-full px-[5%]">
          {!openQuiz && !addNewQuiz && (
            <>
              <PageHeader title="Quiz" />
              <div className="flex flex-wrap mt-10">
                {quizList.map((quiz) => (
                  <Card
                    text={quiz.title}
                    close={quiz.close}
                    key={quiz.quizId}
                    isQuiz={true}
                    handleOpen={() => {
                      setOpenQuiz((prev) => !prev);
                      setCurrentQuiz(quiz.quizId);
                    }}
                  />
                ))}
                <div
                  className="flex flex-col rounded-lg items-center justify-center gap-2 shadow-md p-5 my-2 mx-5 w-[350px] h-[160px] cursor-pointer hover:shadow-lg"
                  onClick={() => setAddNewQuiz((prev) => !prev)}
                >
                  <AddIcon color="primary" fontSize="large" />
                </div>
              </div>
            </>
          )}
          {addNewQuiz && (
            <AddOrEditQuiz
              handleAddNewQuiz={handleAddNewQuiz}
              closeQuiz={() => setAddNewQuiz((prev) => !prev)}
              courseId={courseData._id}
              isEditing={false}
            />
          )}
          {openQuiz && (
            <AdminQuiz
              quizId={currentQuiz}
              handleClose={() => setOpenQuiz((prev) => !prev)}
              courseId={courseData._id}
            />
          )}
        </div>
      </ContentContainer>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<QuizProps> = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
})(async ({ AuthUser, query }): Promise<{ props: QuizProps } | { notFound: true }> => {
  const { courseId } = query;

  if (courseId === undefined || typeof courseId !== "string") {
    return { notFound: true };
  }

  const [courseDetails, courseDetailsErr] = await getUserCourseDetails(
    await AuthUser.getIdToken(),
    courseId as string,
    "ssr",
  );

  if (courseDetailsErr !== null) {
    console.error(courseDetailsErr);
    // handle error
    return { notFound: true };
  }

  if (courseDetails === null) throw new Error("This shouldn't have happened");

  return { props: { courseData: courseDetails } };
});

export default withAuthUser<QuizProps>({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(Quiz);
