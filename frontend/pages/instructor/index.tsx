import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import AddIcon from "@mui/icons-material/Add";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { Accordion, AccordionDetails, AccordionSummary, TextField } from "@mui/material";
import { BasicCourseInfo } from "models/course.model";
import { UserDetails } from "models/user.model";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { AdminNavBar, ContentContainer, Loading } from "components";
import { defaultAdminRoutes } from "components/Layout/NavBars/NavBar";
import CourseCard from "components/common/CourseCard";
import { useUser } from "util/UserContext";
import initAuth from "util/firebase";
import { adminRouteAccess } from "util/util";

initAuth(); // SSR maybe, i think...

const Admin = (): JSX.Element => {
  const user = useUser();
  const authUser = useAuthUser();
  const router = useRouter();
  const [loading, setLoading] = React.useState(user.userDetails === null);
  const [showedCourses, setShowedCourses] = useState<BasicCourseInfo[]>([]);
  const [archivedCourses, setArchivedCourses] = useState<BasicCourseInfo[]>([]);
  const [searchCode, setSearchCode] = useState("");

  React.useEffect(() => {
    // Build user data for user context
    if (user.userDetails !== null) {
      setLoading(false);

      setShowedCourses([...user.userDetails.created_courses.filter((course) => !course.archived)]);
      setArchivedCourses([...user.userDetails.created_courses.filter((course) => course.archived)]);
    }
  }, [user.userDetails]);

  if (loading || user.userDetails === null) return <Loading />;
  const userDetails = user.userDetails as UserDetails;

  // search course id
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (userDetails.created_courses !== undefined) {
        setShowedCourses([
          ...userDetails.created_courses.filter(
            (course) => course.code.includes(searchCode) && !course.archived,
          ),
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
              data-cy="createCourseDiv"
            >
              <AddIcon fontSize="large" color="primary" />
            </div>
          </div>
          {archivedCourses.length > 0 && (
            <div>
              <Accordion elevation={3} className="mt-5 mb-5">
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <h3>Archived Courses</h3>
                </AccordionSummary>
                <AccordionDetails>
                  {archivedCourses?.map((course, index) => (
                    <CourseCard key={index} course={course} href={`/instructor/${course._id}`} />
                  ))}
                </AccordionDetails>
              </Accordion>
            </div>
          )}
        </div>
      </ContentContainer>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
})(async ({ AuthUser }) => {
  if (!(await adminRouteAccess(await AuthUser.getIdToken(), AuthUser.email ?? ""))) {
    return { notFound: true };
  }

  return {
    props: {},
  };
});

export default withAuthUser({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
  // LoaderComponent: MyLoader,
})(Admin);
