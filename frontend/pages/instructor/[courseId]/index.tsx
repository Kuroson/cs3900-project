import React from "react";
import Head from "next/head";
import { UserCourseInformation } from "models/course.model";
import { OnlineClassInterface } from "models/onlineClass.model";
import { UserDetails } from "models/user.model";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { AdminNavBar, ContentContainer, Loading, OnlineClassCard } from "components";
import { useUser } from "util/UserContext";
import { getUserCourseDetails } from "util/api/courseApi";
import initAuth from "util/firebase";
import { adminRouteAccess } from "util/util";

initAuth(); // SSR maybe, i think...

type AdminCoursePageProps = {
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
            href={`/instructor/${courseId}/onlineClass/${x._id}`}
          />
        );
      })}
    </div>
  );
};

const AdminCoursePage = ({ courseData }: AdminCoursePageProps): JSX.Element => {
  const user = useUser();
  const authUser = useAuthUser();
  const [loading, setLoading] = React.useState(user.userDetails === null);
  const [dynamicOnlineClass, setDynamicOnlineClass] = React.useState(courseData.onlineClasses);

  React.useEffect(() => {
    if (courseData !== null) {
      setDynamicOnlineClass(courseData.onlineClasses);
    }
  }, [courseData.onlineClasses, courseData]);

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
        <title>Course page</title>
        <meta name="description" content="Home page" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <AdminNavBar userDetails={userDetails} courseData={courseData} showAddPage={true} />
      <ContentContainer>
        <div className="flex flex-col w-full justify-center px-[5%]">
          <h1 className="text-3xl w-full text-left border-solid border-t-0 border-x-0 border-[#EEEEEE] pt-3">
            <span className="ml-4">Welcome to {courseData.title}</span>
          </h1>
          <p className="pt-1.5">{courseData.description}</p>
          <LectureCards courseId={courseData._id} onlineClasses={dynamicOnlineClass} />
        </div>
      </ContentContainer>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<AdminCoursePageProps> = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
})(async ({ AuthUser, query }): Promise<{ props: AdminCoursePageProps } | { notFound: true }> => {
  const { courseId } = query;

  if (courseId === undefined || typeof courseId !== "string") {
    return { notFound: true };
  }

  if (!(await adminRouteAccess(await AuthUser.getIdToken(), AuthUser.email ?? ""))) {
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

export default withAuthUser<AdminCoursePageProps>({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
  // LoaderComponent: MyLoader,
})(AdminCoursePage);
