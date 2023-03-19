/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { toast } from "react-toastify";
import Head from "next/head";
import HomeIcon from "@mui/icons-material/Home";
import { TextField } from "@mui/material";
import { BasicCourseInfo } from "models/course.model";
import { UserDetails } from "models/user.model";
import { AuthAction, useAuthUser, withAuthUser } from "next-firebase-auth";
import { ContentContainer, StudentNavBar } from "components";
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
  const [loading, setLoading] = React.useState(user.userDetails !== null);
  const [searchCode, setSearchCode] = useState("");
  const [showedCourses, setShowedCourses] = useState<BasicCourseInfo[]>(
    user.userDetails?.enrolments ?? [],
  );
  const authUser = useAuthUser();
  console.log(authUser);

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
            setShowedCourses(res.userDetails.enrolments);
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

  // search course id
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (userDetails.enrolments !== undefined) {
        setShowedCourses([
          ...userDetails.enrolments.filter((course) => course.code.includes(searchCode)),
        ]);
      }
    }
  };

  const studentRoutes: Routes[] = [
    { name: "Dashboard", route: "/", icon: <HomeIcon fontSize="large" color="primary" /> },
    ...userDetails.enrolments.map((x) => {
      return {
        name: x.code,
        route: `/course/${x._id}`,
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
              return <CourseCard key={index} course={x} href={`/course/${x._id}`} />;
            })}
          </div>
        </div>
      </ContentContainer>
    </>
  );
};

export default withAuthUser<HomePageProps>({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
  // LoaderComponent: MyLoader,
})(HomePage);
