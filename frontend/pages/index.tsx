/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { toast } from "react-toastify";
import Head from "next/head";
import HomeIcon from "@mui/icons-material/Home";
import { TextField } from "@mui/material";
import { UserEnrolmentInformation } from "models/enrolment.model";
import { UserDetails } from "models/user.model";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { ContentContainer, Loading, StudentNavBar } from "components";
import { Routes } from "components/Layout/NavBars/NavBar";
import CourseCard from "components/common/CourseCard";
import { useUser } from "util/UserContext";
import { getUserDetails } from "util/api/userApi";
import initAuth from "util/firebase";

initAuth(); // SSR maybe, i think...

export type Course = {
  courseId: string;
  code: string;
  title: string;
  description: string;
  session: string;
  icon: string;
};

type HomePageProps = {
  userDetails: UserDetails;
};

const HomePage = (): JSX.Element => {
  const user = useUser();
  const authUser = useAuthUser();
  const [loading, setLoading] = React.useState(user.userDetails !== null);
  const [searchCode, setSearchCode] = useState("");
  const [showedCourses, setShowedCourses] = useState<UserEnrolmentInformation[]>(
    user.userDetails?.enrolments ?? [],
  );

  React.useEffect(() => {
    if (user.userDetails !== null) {
      setLoading(false);
    }
    setShowedCourses(user.userDetails?.enrolments ?? []);
  }, [user.userDetails]);

  if (loading || user.userDetails === null) return <Loading />;
  const userDetails = user.userDetails as UserDetails;

  // search course id
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (userDetails.enrolments !== undefined) {
        setShowedCourses([
          ...userDetails.enrolments.filter((course) => course.course.code.includes(searchCode)),
        ]);
      }
    }
  };
  console.log(userDetails.enrolments);
  const studentRoutes: Routes[] = [
    { name: "Dashboard", route: "/", icon: <HomeIcon fontSize="large" color="primary" /> },
    ...userDetails.enrolments.map((x) => {
      return {
        name: x.course.code,
        route: `/course/${x.course._id}`,
        // Icon: <HomeIcon fontSize="large" color="primary" />,
      };
    }),
  ];

  return (
    <>
      <Head>
        <title>Home page</title>
        <meta name="description" content="Home page" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <StudentNavBar userDetails={userDetails} routes={studentRoutes} />
      <ContentContainer>
        <div className="flex flex-col w-full justify-center px-[5%]">
          <h1 className="text-3xl w-full text-left border-solid border-t-0 border-x-0 border-[#EEEEEE] mt-5">
            <span className="ml-4">
              Welcome, {`${userDetails.first_name} ${userDetails.last_name}`}
            </span>
          </h1>
          <div className="flex justify-between mx-6 mt-2">
            <h2>Course Overview</h2>
            <div className="">
              <TextField
                id="search course"
                label="Search Course Code"
                variant="outlined"
                sx={{ width: "300px" }}
                onKeyDown={handleKeyDown}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchCode(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-wrap w-full mx-3">
            {showedCourses?.map((x, index) => {
              return <CourseCard key={index} course={x.course} href={`/course/${x.course._id}`} />;
            })}
          </div>
        </div>
      </ContentContainer>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
})(async ({ AuthUser }) => {
  const [res, err] = await getUserDetails(await AuthUser.getIdToken(), AuthUser.email ?? "", "ssr");

  if (res?.userDetails !== null && res?.userDetails.role === 0) {
    // Instructor
    return {
      redirect: {
        destination: "/instructor",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
});

export default withAuthUser<HomePageProps>({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
  // LoaderComponent: MyLoader,
})(HomePage);
