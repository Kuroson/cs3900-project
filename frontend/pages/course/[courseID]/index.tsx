/* eslint-disable @typescript-eslint/no-explicit-any */
import Head from "next/head";
import HomeIcon from "@mui/icons-material/Home";
import { GetServerSideProps } from "next";
import { AuthAction, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { UserDetailsPayload } from "pages";
import { ContentContainer, SideNavbar } from "components";
import { Routes } from "components/Layout/SideNavBar";
import { PROCESS_BACKEND_URL, apiGet } from "util/api";
import initAuth from "util/firebase";
import {
  CourseGETResponse,
  CourseInformation,
  CourseInformationFull,
  getRoleName,
} from "util/util";

initAuth();

type StudentCoursePageProps = {
  userDetails: UserDetailsPayload;
  courseInformation: CourseInformationFull | null;
  courseRoutes: Routes[];
};

const StudentCoursePage = ({
  userDetails,
  courseInformation,
  courseRoutes,
}: StudentCoursePageProps): JSX.Element => {
  console.log(userDetails, courseInformation);
  return (
    <>
      <Head>
        <title>{`${courseInformation?.code} ${courseInformation?.session}`}</title>
        <meta name="description" content={courseInformation?.description} />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <SideNavbar
        firstName={userDetails.firstName}
        lastName={userDetails.lastName}
        role={getRoleName(1)} // userDetails.role)} // TODO: CHANGE BACK LATER
        avatarURL={userDetails.avatar}
        list={courseRoutes}
        showDashboardRoute
      />
      <ContentContainer>
        <div className="flex flex-col w-full justify-center px-[5%]">
          <h1 className="text-3xl w-full text-left border-solid border-t-0 border-x-0 border-[#EEEEEE]">
            <span className="ml-4">Welcome to {courseInformation?.title}</span>
          </h1>
        </div>
      </ContentContainer>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<StudentCoursePageProps> = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
})(async ({ AuthUser, query }): Promise<{ props: StudentCoursePageProps } | { notFound: true }> => {
  const { courseID } = query;

  const [resUserData, errUserData] = await apiGet<any, UserDetailsPayload>(
    `${PROCESS_BACKEND_URL}/user/details`,
    await AuthUser.getIdToken(),
    {},
  );

  // Fetch Course Specific Information
  const [resCourseInformation, errCourseInformation] = await apiGet<any, CourseInformationFull>(
    `${PROCESS_BACKEND_URL}/course/${courseID}`,
    await AuthUser.getIdToken(),
    {},
  );

  if (errUserData !== null || errCourseInformation !== null) {
    console.error(errUserData ?? errCourseInformation);
    // handle error
    return { notFound: true };
  }

  if (resUserData === null || resCourseInformation === null)
    throw new Error("This shouldn't have happened");

  const courseRoutes: Routes[] = resCourseInformation.pages.map((x) => {
    return {
      name: x.title,
      route: `/course/${courseID}/${x.pageId}`,
    };
  });

  return {
    props: {
      userDetails: { ...resUserData },
      courseInformation: resCourseInformation,
      courseRoutes: courseRoutes,
    },
  };
});

export default withAuthUser<StudentCoursePageProps>({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(StudentCoursePage);
