/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { toast } from "react-toastify";
import Head from "next/head";
import { LoadingButton } from "@mui/lab";
import { TextField } from "@mui/material";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { AdminNavBar, ContentContainer, Loading } from "components";
import { HttpException } from "util/HttpExceptions";
import { useUser } from "util/UserContext";
import {
  addStudentToCourse,
  getUserCourseDetails,
  removeStudentFromCourse,
} from "util/api/courseApi";
import initAuth from "util/firebase";
import { adminRouteAccess } from "util/util";
import { UserCourseInformation } from "models/course.model";
import { UserDetails } from "models/user.model";

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
    if (user.userDetails !== null) {
      setLoading(false);
    }
  }, [user.userDetails]);

  if (loading || user.userDetails === null) return <Loading />;
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
      toast.error(`${res.invalidEmails.length} emails were not removed: ${res.invalidEmails}`);
      setButtonLoading(false);
      return;
    }

    toast.info("Student removed successfully");
    setButtonLoading(false);
  };

  return (
    <>
      <Head>
        <title>Add Students</title>
        <meta name="description" content="Add students to a course" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AdminNavBar userDetails={userDetails} courseData={courseData} showAddPage={true} />
      <ContentContainer>
        <div className="flex flex-col w-full justify-center px-[5%]">
          <h1 className="text-3xl w-full text-left border-solid border-t-0 border-x-0 border-[#EEEEEE] pt-3">
            <span className="ml-4">Students</span>
          </h1>
          <div className="w-full flex flex-col justify-center items-center pt-4">
            <h2 className="text-left w-full pb-4">Add Students</h2>
            <div className="flex w-full flex-col">
              <TextField
                id="student-email"
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

export default withAuthUser<AddStudentPageProps>({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(AddStudentsPage);
