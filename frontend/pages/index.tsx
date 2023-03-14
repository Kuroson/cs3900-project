import Head from "next/head";
import HomeIcon from "@mui/icons-material/Home";
import { TextField } from "@mui/material";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { ContentContainer, Footer, LeftSideBar, SideNavbar } from "components";
import { Routes } from "components/Layout/SideNavBar";
import { PROCESS_BACKEND_URL, apiGet } from "util/api";
import initAuth from "util/firebase";
import { Nullable, getRoleName, getCourseURL } from "util/util";
import CourseCard from "components/common/CourseCard";
import { useState } from "react";

initAuth(); // SSR maybe, i think...

type UserDetailsPayload = Nullable<{
  firstName: string;
  lastName: string;
  email: string;
  role: number;
  avatar: string;
}>;

type EnrolmentsPayload = Nullable<{
  coursesEnrolled: Array<any>;
}>;

export type Course = {
  courseId: string;
  code: string;
  title: string;
  description: string;
  session: string;
  icon: string;
};

type HomePageProps = UserDetailsPayload & EnrolmentsPayload;

const HomePage = ({ firstName, lastName, email, role, avatar, coursesEnrolled }: HomePageProps): JSX.Element => {
  const authUser = useAuthUser(); 
  console.log(firstName, lastName, email, role, avatar, coursesEnrolled);

  const studentRoutes: Routes[] = [
    { name: "Dashboard", route: "/", Icon: <HomeIcon fontSize="large" color="primary" /> }
  ];

  const allCourses = coursesEnrolled;
  const [showedCourses, setShowedCourses] = useState(coursesEnrolled);
  const [code, setCode] = useState("");
  
  // search course id
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (allCourses != null) {
        setShowedCourses(allCourses.filter((course) => course.code.includes(code)));
      }
    }
  };

  return (
    <>
      <Head>
        <title>Home page</title>
        <meta name="description" content="Home page" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <SideNavbar
        firstName={firstName}
        lastName={lastName}
        role={getRoleName(role)}
        avatarURL={avatar}
        list={studentRoutes}
      />
      <ContentContainer>
        <div className="flex flex-col w-full justify-center px-[5%]">
          <h1 className="text-3xl w-full text-left border-solid border-t-0 border-x-0 border-[#EEEEEE]">
            <span className="ml-4">Welcome, {`${firstName} ${lastName}`}</span>
          </h1>
          <div className="flex justify-between mx-6">
            <h2>Course Overview</h2>
            <TextField
              id="search course"
              label="Search Course Code"
              variant="outlined"
              sx={{ width: "300px" }}
              onKeyDown={handleKeyDown}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCode(e.target.value)}
            />
          </div>
        <div className="flex flex-wrap w-full mx-3">
            {showedCourses?.map((x, index) => {
              return <CourseCard key={index} course={x} href={`/${x.courseId}`} />
            })}
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
  const [data, err] = await apiGet<any, HomePageProps>(
    `${PROCESS_BACKEND_URL}/user/details`,
    await AuthUser.getIdToken(),
    {},
  );

  if (err !== null) {
    console.error(err);
    // handle error
    return {
      props: {
        email: null,
        firstName: null,
        lastName: null,
        role: null,
        avatar: null,
        coursesEnrolled: null,
      },
    };
  }

  if (data === null) throw new Error("This shouldn't have happened");
  return {
    props: {
      ...data,
    },
  };
});

export default withAuthUser<HomePageProps>({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
  // LoaderComponent: MyLoader,
})(HomePage);
