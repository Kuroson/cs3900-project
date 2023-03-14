/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Head from "next/head";
import { useRouter } from "next/router";
import GridViewIcon from "@mui/icons-material/GridView";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { LoadingButton } from "@mui/lab";
import { Button, TextField } from "@mui/material";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { UserDetailsPayload } from "pages";
import { ContentContainer, SideNavbar } from "components";
import { Routes } from "components/Layout/SideNavBar";
import { HttpException } from "util/HttpExceptions";
import { PROCESS_BACKEND_URL, apiGet, apiPut } from "util/api";
import initAuth from "util/firebase";
import { CourseInformationFull, Nullable, getRoleName } from "util/util";

initAuth(); // SSR maybe, i think...

type AddStudentPageProps = {
  userDetails: UserDetailsPayload;
  courseInformation: CourseInformationFull | null;
  courseRoutes: Routes[];
  courseID: string;
};

type AddStudentResponse = {
  invalidEmails: string[];
};

type AddStudentPayload = {
  courseId: string;
  students: Array<string>;
};

const AddStudentsPage = ({
  userDetails,
  courseInformation,
  courseRoutes,
  courseID,
}: AddStudentPageProps): JSX.Element => {
  // TODO: Fix metadata thing
  const authUser = useAuthUser();
  const [studentEmail, setStudentEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  console.log(courseInformation);
  const handleOnSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (studentEmail === "") {
      toast.warning("Please enter a student email");
      return;
    }
    // data valid
    setLoading(true);
    // TODO Fix this import, should be a prop
    const [res, err] = await apiPut<AddStudentPayload, AddStudentResponse>(
      `${PROCESS_BACKEND_URL}/course/students/add`,
      await authUser.getIdToken(),
      {
        courseId: courseID,
        students: [studentEmail],
      },
    );

    if (err !== null) {
      if (err instanceof HttpException) {
        toast.error(err.message);
      } else {
        toast.error(err);
      }
      setLoading(false);
      return;
    }

    if (res === null) throw new Error("Response and error are null"); // Actual error that should never happen

    if (res.invalidEmails.length !== 0) {
      toast.error(`${res.invalidEmails.length} emails were not added: ${res.invalidEmails}`);
      setLoading(false);
      return;
    }
    toast.info("Student added successfully");
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Add Students</title>
        <meta name="description" content="Add students to a page" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <SideNavbar
        firstName={userDetails.firstName}
        lastName={userDetails.lastName}
        role={getRoleName(userDetails.role)}
        avatarURL={userDetails.avatar}
        list={courseRoutes}
        isCoursePage={true}
        courseCode={courseInformation?.code}
        courseIcon={courseInformation?.icon}
        courseId={courseInformation?.courseId}
        showDashboardRoute
      />
      <ContentContainer>
        <div className="flex flex-col w-full justify-center px-[5%]">
          <h1 className="text-3xl w-full text-left border-solid border-t-0 border-x-0 border-[#EEEEEE]">
            <span className="ml-4">Students</span>
          </h1>
          <form
            className="w-full flex flex-col justify-center items-center"
            onSubmit={handleOnSubmit}
          >
            <div className="flex w-full">
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
              <LoadingButton variant="contained" type="submit" loading={loading}>
                Submit
              </LoadingButton>
            </div>
          </form>
        </div>
      </ContentContainer>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<AddStudentPageProps> = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
})(async ({ AuthUser, query }): Promise<{ props: AddStudentPageProps } | { notFound: true }> => {
  const { courseId } = query;

  const [resUserData, errUserData] = await apiGet<any, UserDetailsPayload>(
    `${PROCESS_BACKEND_URL}/user/details`,
    await AuthUser.getIdToken(),
    {},
  );

  // Fetch Course Specific Information
  const [resCourseInformation, errCourseInformation] = await apiGet<any, CourseInformationFull>(
    `${PROCESS_BACKEND_URL}/course/${courseId}`,
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

  if (resUserData === null) throw new Error("This shouldn't have happened");

  const courseRoutes: Routes[] = resCourseInformation.pages.map((x) => {
    return {
      name: x.title,
      route: `/course/${courseId}/${x.pageId}`,
    };
  });

  return {
    props: {
      userDetails: { ...resUserData },
      courseInformation: resCourseInformation,
      courseRoutes: courseRoutes,
      courseID: courseId as string,
    },
  };
});

export default withAuthUser<AddStudentPageProps>({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(AddStudentsPage);
