/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { toast } from "react-toastify";
import Head from "next/head";
import GridViewIcon from "@mui/icons-material/GridView";
import HomeIcon from "@mui/icons-material/Home";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { LoadingButton } from "@mui/lab";
import { TextField } from "@mui/material";
import { UserCourseInformation } from "models/course.model";
import { UserDetails } from "models/user.model";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { AdminNavBar, ContentContainer } from "components";
import { Routes } from "components/Layout/NavBars/NavBar";
import { HttpException } from "util/HttpExceptions";
import { useUser } from "util/UserContext";
import {
  addStudentToCourse,
  getUserCourseDetails,
  removeStudentFromCourse,
} from "util/api/courseApi";
import { getUserDetails } from "util/api/userApi";
import initAuth from "util/firebase";

initAuth(); // SSR maybe, i think...

type AddStudentPageProps = {
  courseData: UserCourseInformation;
};

const AddStudentsPage = ({ courseData }: AddStudentPageProps): JSX.Element => {
  // TODO: Fix metadata thing
  const user = useUser();
  const authUser = useAuthUser();
  const [loading, setLoading] = React.useState(user.userDetails === null);

  const [studentEmail, setStudentEmail] = React.useState("");
  const [buttonLoading, setButtonLoading] = React.useState(false);

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

  const handleOnClickAdd = async () => {
    if (studentEmail === "") {
      toast.warning("Please enter a student email");
      return;
    }
    // data valid
    setButtonLoading(true);
    const [res, err] = await addStudentToCourse(
      await authUser.getIdToken(),
      courseData._id,
      studentEmail,
      "client",
    );

    if (err !== null) {
      if (err instanceof HttpException) {
        toast.error(err.message);
      } else {
        toast.error(err);
      }
      setButtonLoading(false);
      return;
    }
    if (res === null) throw new Error("Response and error are null"); // Actual error that should never happen
    if (res.invalidEmails.length !== 0) {
      toast.error(`${res.invalidEmails.length} emails were not added: ${res.invalidEmails}`);
      setButtonLoading(false);
      return;
    }

    toast.info("Student added successfully");
    setButtonLoading(false);
  };

  const handleOnClickRemove = async () => {
    if (studentEmail === "") {
      toast.warning("Please enter a student email");
      return;
    }
    // data valid
    setButtonLoading(true);
    const [res, err] = await removeStudentFromCourse(
      await authUser.getIdToken(),
      courseData._id,
      studentEmail,
      "client",
    );

    if (err !== null) {
      if (err instanceof HttpException) {
        toast.error(err.message);
      } else {
        toast.error(err);
      }
      setButtonLoading(false);
      return;
    }
    if (res === null) throw new Error("Response and error are null"); // Actual error that should never happen
    if (res.invalidEmails.length !== 0) {
      toast.error(`${res.invalidEmails.length} emails were not added: ${res.invalidEmails}`);
      setButtonLoading(false);
      return;
    }

    toast.info("Student added successfully");
    setButtonLoading(false);
  };

  const navRoutes: Routes[] = [
    {
      name: "Dashboard",
      route: "/instructor",
      icon: <HomeIcon fontSize="large" color="primary" />,
    },
    {
      name: "Home",
      route: `/instructor/${courseData._id}`,
      icon: <GridViewIcon fontSize="large" color="primary" />,
    },
    {
      name: "Students",
      route: `/instructor/${courseData._id}/students`,
      icon: <PeopleAltIcon fontSize="large" color="primary" />,
      hasLine: true,
    },
    ...courseData.pages.map((page) => ({
      name: page.title,
      route: `/instructor/${courseData._id}/${page._id}`,
    })),
  ];

  return (
    <>
      <Head>
        <title>Add Students</title>
        <meta name="description" content="Add students to a page" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <AdminNavBar userDetails={userDetails} routes={navRoutes} courseData={courseData} />
      <ContentContainer>
        <div className="flex flex-col w-full justify-center px-[5%]">
          <h1 className="text-3xl w-full text-left border-solid border-t-0 border-x-0 border-[#EEEEEE] pt-3">
            <span className="ml-4">Students</span>
          </h1>
          <div className="w-full flex flex-col justify-center items-center pt-4">
            <h2 className="text-left w-full pb-4">Add Students</h2>
            <div className="flex w-full flex-col">
              <TextField
                id="outlined-basic"
                label="Student Email"
                variant="outlined"
                value={studentEmail}
                className="w-[20rem]"
                onChange={(e) => setStudentEmail(e.target.value)}
              />
            </div>
            <div className="pt-10 flex w-full justify-start">
              <LoadingButton
                variant="contained"
                type="submit"
                loading={buttonLoading}
                onClick={handleOnClickAdd}
              >
                Add Student
              </LoadingButton>
              <div className="pl-5">
                <LoadingButton
                  variant="contained"
                  type="submit"
                  loading={buttonLoading}
                  onClick={handleOnClickRemove}
                >
                  Remove student
                </LoadingButton>
              </div>
            </div>
          </div>
        </div>
      </ContentContainer>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<AddStudentPageProps> = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
})(async ({ AuthUser, query }): Promise<{ props: AddStudentPageProps } | { notFound: true }> => {
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

export default withAuthUser<AddStudentPageProps>({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(AddStudentsPage);
