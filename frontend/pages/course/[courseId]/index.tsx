/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { toast } from "react-toastify";
import Head from "next/head";
import HomeIcon from "@mui/icons-material/Home";
import { UserCourseInformation } from "models/course.model";
import { OnlineClassInterface } from "models/onlineClass.model";
import { UserDetails } from "models/user.model";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { ContentContainer, Loading, OnlineClassCard, StudentNavBar } from "components";
import { Routes } from "components/Layout/NavBars/NavBar";
import { useUser } from "util/UserContext";
import { getUserCourseDetails } from "util/api/courseApi";
import { getUserDetails } from "util/api/userApi";
import initAuth from "util/firebase";

initAuth();

type StudentCoursePageProps = {
  courseData: UserCourseInformation;
};

type LectureCardProps = {
  courseId: string;
  onlineClasses: OnlineClassInterface[];
};

const LectureCards = ({ onlineClasses, courseId }: LectureCardProps): JSX.Element => {
  return (
    <div className="flex flex-wrap w-full mx-3">
      {onlineClasses.map((x) => {
        return (
          <OnlineClassCard
            key={x._id}
            onlineClass={x}
            // Only show href for running classes
            href={`/course/${courseId}/onlineClass/${x._id}`}
          />
        );
      })}
    </div>
  );
};

/**
 * Base page for a course for a student
 * Course data is SSR
 */
const StudentCoursePage = ({ courseData }: StudentCoursePageProps): JSX.Element => {
  const user = useUser();
  const authUser = useAuthUser();
  const [loading, setLoading] = React.useState(user.userDetails === null);

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
        <title>{`${courseData.code} ${courseData.session}`}</title>
        <meta name="description" content={courseData.description} />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <StudentNavBar userDetails={userDetails} courseData={courseData} />
      <ContentContainer>
        <div className="flex flex-col w-full justify-center px-[5%]">
          <h1 className="text-3xl w-full text-left border-solid border-t-0 border-x-0 border-[#EEEEEE] mt-5">
            <span className="ml-4">Welcome to {courseData.title}</span>
          </h1>
          {courseData.archived && (
            <div className="w-full text-center bg-[#F2D467] p-1 border-radius-10">
              Course has been archived
            </div>
          )}
          <p className="mt-5">{courseData.description}</p>
          <LectureCards onlineClasses={courseData.onlineClasses} courseId={courseData._id} />
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
})(StudentCoursePage);
