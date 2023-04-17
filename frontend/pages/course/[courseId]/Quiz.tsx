/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { ContentContainer, Loading, StudentNavBar } from "components";
import Card from "components/common/Card";
import PageHeader from "components/common/PageHeader";
import StudentQuiz from "components/quiz/StudentQuiz";
import { HttpException } from "util/HttpExceptions";
import { useUser } from "util/UserContext";
import { getUserCourseDetails } from "util/api/courseApi";
import { getListOfQuizzes } from "util/api/quizApi";
import initAuth from "util/firebase";
import { UserCourseInformation } from "models/course.model";
import { QuizListType } from "models/quiz.model";
import { UserDetails } from "models/user.model";

initAuth();

type StudentCoursePageProps = {
  courseData: UserCourseInformation;
};

const QuizStudent = ({ courseData }: StudentCoursePageProps): JSX.Element => {
  const [quizList, setQuizList] = useState<QuizListType[]>([]);
  const user = useUser();
  const authUser = useAuthUser();
  const [loading, setLoading] = React.useState(user.userDetails === null);
  const [openQuiz, setOpenQuiz] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState("");
  const [isResponded, setIsResponded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
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
    if (!openQuiz) {
      getQuizzes();
    }
  }, [authUser, courseData._id, openQuiz]);

  React.useEffect(() => {
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
        <title>{`${courseData.code} Quiz`}</title>
        <meta name="description" content={courseData.description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <StudentNavBar userDetails={userDetails} courseData={courseData} />
      <ContentContainer>
        <div className="flex flex-col w-full justify-center px-[5%]">
          {!openQuiz && (
            <>
              <PageHeader title="Quiz" />
              <div className="flex flex-wrap mt-10">
                {quizList.map((quiz) => (
                  <Card
                    text={quiz.title}
                    close={quiz.close}
                    open={quiz.open}
                    key={quiz.quizId}
                    isQuiz={true}
                    handleOpen={() => {
                      setOpenQuiz((prev) => !prev);
                      setCurrentQuiz(quiz.quizId);
                      setIsResponded(quiz.isResponded ?? false);
                      setIsOpen(
                        new Date() < new Date(Date.parse(quiz.close)) &&
                          new Date() > new Date(Date.parse(quiz.open)),
                      );
                    }}
                  />
                ))}
              </div>
            </>
          )}
          {openQuiz && (
            <StudentQuiz
              quizId={currentQuiz}
              handleClose={() => setOpenQuiz((prev) => !prev)}
              courseId={courseData._id}
              isResponded={isResponded}
              isOpen={isOpen}
            />
          )}
        </div>
      </ContentContainer>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<StudentCoursePageProps> = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
})(async ({ AuthUser, query }): Promise<{ props: StudentCoursePageProps } | { notFound: true }> => {
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

export default withAuthUser<StudentCoursePageProps>({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(QuizStudent);
