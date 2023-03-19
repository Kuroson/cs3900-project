import React, { useState } from "react";
import { toast } from "react-toastify";
import Head from "next/head";
import { useRouter } from "next/router";
import AddIcon from "@mui/icons-material/Add";
import { TextField } from "@mui/material";
import { BasicCourseInfo } from "models/course.model";
import { UserDetails } from "models/user.model";
import { AuthAction, useAuthUser, withAuthUser } from "next-firebase-auth";
import { AdminNavBar, ContentContainer } from "components";
import { defaultAdminRoutes } from "components/Layout/NavBars/NavBar";
import CourseCard from "components/common/CourseCard";
import { useUser } from "util/UserContext";
import { getUserDetails } from "util/api/userApi";
import initAuth from "util/firebase";

initAuth(); // SSR maybe, i think...

const Admin = (): JSX.Element => {
  const user = useUser();
  const [loading, setLoading] = React.useState(user.userDetails === null);
  const [showedCourses, setShowedCourses] = useState<BasicCourseInfo[]>(
    user.userDetails?.created_courses ?? [],
  );
  const [searchCode, setSearchCode] = useState("");

  // const allCourses = courses;
  const authUser = useAuthUser();
  const router = useRouter();
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
          setShowedCourses(res.userDetails.created_courses);
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

  return (
    <>
      <Head>
        <title>Admin page</title>
        <meta name="description" content="Home page" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <AdminNavBar userDetails={userDetails} routes={defaultAdminRoutes} />
      <ContentContainer>
        <div className="flex flex-col w-full justify-center px-[5%]">
          <h1 className="text-3xl w-full text-left border-solid border-t-0 border-x-0 border-[#EEEEEE] pt-4">
            <span className="ml-4">
              Welcome, {`${userDetails.first_name} ${userDetails.last_name}`}
            </span>
          </h1>
          {/* admin dashboard */}
          <div className="flex justify-between mx-6 pt-2">
            <h2>Course Overview</h2>
            <TextField
              id="search course"
              label="Search Course Code"
              variant="outlined"
              sx={{ width: "300px" }}
              onKeyDown={handleKeyDown}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchCode(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap w-full mx-3">
            {showedCourses?.map((course, index) => (
              <CourseCard key={index} course={course} href={`/instructor/${course._id}`} />
            ))}
            <div
              className="flex flex-col rounded-lg shadow-md p-5 my-2 mx-5 w-[370px] h-[264px] cursor-pointer hover:shadow-lg items-center justify-center"
              onClick={() => router.push("/instructor/create-course")}
            >
              <AddIcon fontSize="large" color="primary" />
            </div>
          </div>
        </div>
      </ContentContainer>
    </>
  );
};

export default withAuthUser({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
  // LoaderComponent: MyLoader,
})(Admin);
