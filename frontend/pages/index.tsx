/* eslint-disable @typescript-eslint/no-explicit-any */
import Head from "next/head";
import HomeIcon from "@mui/icons-material/Home";
import { TextField } from "@mui/material";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { ContentContainer, Footer, LeftSideBar, SideNavbar } from "components";
import { Routes } from "components/Layout/SideNavBar";
import { PROCESS_BACKEND_URL, apiGet } from "util/api";
import initAuth from "util/firebase";
import { CourseGETResponse, Nullable, getRoleName } from "util/util";

initAuth(); // SSR maybe, i think...

export type UserDetailsPayload = Nullable<{
  firstName: string;
  lastName: string;
  email: string;
  role: number;
  avatar: string;
}>;

type HomePageProps = {
  userDetails: UserDetailsPayload;
  courseRoutes: Routes[];
};

const HomePage = ({ userDetails, courseRoutes }: HomePageProps): JSX.Element => {
  const authUser = useAuthUser();
  console.log(authUser);
  console.log(userDetails);

  return (
    <>
      <Head>
        <title>Home page</title>
        <meta name="description" content="Home page" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <SideNavbar
        firstName={userDetails.firstName}
        lastName={userDetails.lastName}
        role={getRoleName(userDetails.role)}
        avatarURL={userDetails.avatar}
        list={courseRoutes}
        showDashboardRoute
      />
      <ContentContainer>
        <div className="flex flex-col w-full justify-center items-center px-[5%]">
          <h1 className="text-3xl w-full text-left border-solid border-t-0 border-x-0 border-[#EEEEEE]">
            <span className="ml-4">
              Welcome, {`${userDetails.firstName} ${userDetails.lastName}`}
            </span>
          </h1>
          <div className="w-full flex flex-col">
            <h2 className="text-2xl w-full ml-4 m-0">Course Overview</h2>
            <div className="ml-4 pt-5">
              <TextField id="outlined-search" label="Search field" type="search" />
            </div>
          </div>
        </div>
      </ContentContainer>
      {/* <Footer /> */}
    </>
  );
};

export const getServerSideProps: GetServerSideProps<HomePageProps> = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
})(async ({ AuthUser }): Promise<{ props: HomePageProps }> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [resUserData, errUserData] = await apiGet<any, UserDetailsPayload>(
    `${PROCESS_BACKEND_URL}/user/details`,
    await AuthUser.getIdToken(),
    {},
  );

  // Fetch User's course data
  const [resCourseData, errCourseData] = await apiGet<any, CourseGETResponse>(
    `${PROCESS_BACKEND_URL}/course`,
    await AuthUser.getIdToken(),
    {},
  );

  if (errUserData !== null || errCourseData !== null) {
    console.error(errUserData ?? errCourseData);
    // handle error
    return {
      props: {
        userDetails: { email: null, firstName: null, lastName: null, role: null, avatar: null },
        courseRoutes: [],
      },
    };
  }

  if (resUserData === null || resCourseData === null)
    throw new Error("This shouldn't have happened");

  const courseRoutes: Routes[] = resCourseData.courses.map((x) => {
    return {
      name: x.code,
      route: `/course/${x.courseId}`,
    };
  });

  return {
    props: {
      userDetails: resUserData,
      courseRoutes: courseRoutes,
    },
  };
});

export default withAuthUser<HomePageProps>({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
  // LoaderComponent: MyLoader,
})(HomePage);
