/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { toast } from "react-toastify";
import Head from "next/head";
import HomeIcon from "@mui/icons-material/Home";
import { UserCourseInformation } from "models/course.model";
import { UserDetails } from "models/user.model";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { ContentContainer, StudentNavBar } from "components";
import { Routes } from "components/Layout/NavBars/NavBar";
import { useUser } from "util/UserContext";
import { getUserCourseDetails } from "util/api/courseApi";
import { getUserDetails } from "util/api/userApi";
import initAuth from "util/firebase";

initAuth();

type StudentCoursePageProps = {
  courseData: UserCourseInformation;
};

/**
 * Base page for a course for a student
 * Course data is SSR
 */
const StudentCoursePage = ({ courseData }: StudentCoursePageProps): JSX.Element => {
  const user = useUser();
  const [loading, setLoading] = React.useState(user.userDetails === null);
  const authUser = useAuthUser();
  console.log(courseData);

  React.useEffect(() => {
    // Build user data for user context
    const fetchUserData = async () => {
      const [resUserData, errUserData] = await getUserDetails(
        await authUser.getIdToken(),
        authUser.email ?? "bad",
        "client",
      );

      if (errUserData !== null) {
        throw errUserData;
      }

      if (resUserData === null) throw new Error("This shouldn't have happened");
      return resUserData;
    };

    if (user.userDetails === null) {
      fetchUserData()
        .then((res) => {
          if (user.setUserDetails !== undefined) {
            user.setUserDetails(res.userDetails);
          }
        })
        .then(() => setLoading(false))
        .catch((err) => {
          toast.error("failed to fetch shit");
        });
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading || user.userDetails === null) return <div>Loading...</div>;
  const userDetails = user.userDetails as UserDetails;

  const studentRoutes: Routes[] = [
    {
      name: "Dashboard",
      route: "/",
      icon: <HomeIcon fontSize="large" color="primary" />,
      hasLine: true,
    },
    ...courseData.pages.map((x) => {
      return {
        name: x.title,
        route: `/course/${courseData._id}/${x._id}`,
      };
    }),
  ];

  return (
    <>
      <Head>
        <title>{`${courseData.code} ${courseData.session}`}</title>
        <meta name="description" content={courseData.description} />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <StudentNavBar userDetails={userDetails} routes={studentRoutes} />
      <ContentContainer>
        <div className="flex flex-col w-full justify-center px-[5%]">
          <h1 className="text-3xl w-full text-left border-solid border-t-0 border-x-0 border-[#EEEEEE] mt-5">
            <span className="ml-4">Welcome to {courseData.title}</span>
          </h1>
          <p className="mt-5">{courseData.description}</p>
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
