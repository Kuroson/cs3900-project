/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Head from "next/head";
import { UserCourseInformation } from "models/course.model";
import { UserDetails } from "models/user.model";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { AdminNavBar, ContentContainer, Loading } from "components";
import { useUser } from "util/UserContext";
import { getUserCourseDetails } from "util/api/courseApi";
import initAuth from "util/firebase";

initAuth(); // SSR maybe, i think...

type AnalyticsProps = {
  courseData: UserCourseInformation;
};

const Analytics = ({ courseData }: AnalyticsProps): JSX.Element => {
  // TODO: Fix metadata thing
  const user = useUser();
  const authUser = useAuthUser();
  const [loading, setLoading] = React.useState(user.userDetails === null);

  // Analytics information

  useEffect(() => {
    // TODO: fetch data
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
        <title>Analytics</title>
        <meta name="description" content="Analytics" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <AdminNavBar userDetails={userDetails} courseData={courseData} showAddPage={true} />
      <ContentContainer>
        <div className="flex flex-col w-full px-[5%] py-2">Test</div>
      </ContentContainer>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<AnalyticsProps> = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
})(async ({ AuthUser, query }): Promise<{ props: AnalyticsProps } | { notFound: true }> => {
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

export default withAuthUser<AnalyticsProps>({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(Analytics);
