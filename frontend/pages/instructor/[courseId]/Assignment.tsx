/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Head from "next/head";
import AddIcon from "@mui/icons-material/Add";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { AdminNavBar, ContentContainer, Loading } from "components";
import AddOrEditAssignment from "components/assignment/AddOrEditAssignment";
import AdminAssignment from "components/assignment/AdminAssignment";
import Card from "components/common/Card";
import PageHeader from "components/common/PageHeader";
import { HttpException } from "util/HttpExceptions";
import { useUser } from "util/UserContext";
import { createNewAssignment, getListOfAssignments } from "util/api/assignmentApi";
import { getUserCourseDetails } from "util/api/courseApi";
import initAuth from "util/firebase";
import { adminRouteAccess } from "util/util";
import { AssignmentListType, CreateAssignmentType } from "models/assignment.model";
import { UserCourseInformation } from "models/course.model";
import { UserDetails } from "models/user.model";

initAuth(); // SSR maybe, i think...

type AssignmentProps = {
  courseData: UserCourseInformation;
};

const Assignment = ({ courseData }: AssignmentProps): JSX.Element => {
  // TODO: Fix metadata thing
  const user = useUser();
  const authUser = useAuthUser();
  const [loading, setLoading] = React.useState(user.userDetails === null);

  // Assignment info
  const [assignmentList, setAssignmentList] = useState<AssignmentListType[]>([]);
  const [addNewAssignment, setAddNewAssignment] = useState(false);
  const [openAssignment, setOpenAssignment] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState("");

  const handleaddNewAssignment = async (newAssignment: CreateAssignmentType) => {
    // TODO: backend
    const [res, err] = await createNewAssignment(
      await authUser.getIdToken(),
      newAssignment,
      "client",
    );
    if (err !== null) {
      console.error(err);
      if (err instanceof HttpException) {
        toast.error(err.message);
      } else {
        toast.error(err);
      }
      return;
    }
    if (res === null) throw new Error("Response and error are null");

    const assignment: AssignmentListType = {
      assignmentId: res.assignmentId,
      title: newAssignment.title,
      description: newAssignment.description,
      deadline: newAssignment.deadline,
    };
    setAssignmentList((prev) => [...prev, assignment]);
    setAddNewAssignment(false);
    toast.success("Assignment created successfully");
  };

  useEffect(() => {
    const getAssignments = async () => {
      const [res, err] = await getListOfAssignments(
        await authUser.getIdToken(),
        courseData._id,
        "client",
      );
      if (err !== null) {
        console.error(err);
        if (err instanceof HttpException) {
          toast.error(err.message);
        } else {
          toast.error(err);
        }
        return;
      }
      if (res === null) throw new Error("Response and error are null");
      setAssignmentList(res.assignments);
    };
    getAssignments();
  }, [authUser, courseData._id]);

  useEffect(() => {
    // Build user data for user context
    if (user.userDetails !== null) {
      setLoading(false);
    }
  }, [user.userDetails]);

  if (loading || user.userDetails === null) return <Loading />;
  const userDetails = user.userDetails as UserDetails;

  return (
    <>
      <Head>
        <title>Assignment</title>
        <meta name="description" content="Assignment" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AdminNavBar userDetails={userDetails} courseData={courseData} showAddPage={true} />
      <ContentContainer>
        <div className="flex flex-col w-full px-[5%] py-2">
          {!openAssignment && !addNewAssignment && (
            <>
              <PageHeader title="Assignment" />
              <div className="flex flex-wrap mt-10">
                {assignmentList.map((assignment) => (
                  <Card
                    text={assignment.title}
                    close={assignment.deadline}
                    key={assignment.assignmentId}
                    isQuiz={false}
                    handleOpen={() => {
                      setOpenAssignment((prev) => !prev);
                      setCurrentAssignment(assignment.assignmentId);
                    }}
                  />
                ))}
                <div
                  className="flex flex-col rounded-lg items-center justify-center gap-2 shadow-md p-5 my-2 mx-5 w-[330px] h-[160px] cursor-pointer hover:shadow-lg"
                  onClick={() => setAddNewAssignment((prev) => !prev)}
                >
                  <AddIcon color="primary" fontSize="large" />
                </div>
              </div>
            </>
          )}
          {addNewAssignment && (
            <AddOrEditAssignment
              handleAddNewAssignment={handleaddNewAssignment}
              closeAssignment={() => setAddNewAssignment((prev) => !prev)}
              courseId={courseData._id}
              courseTags={courseData.tags}
              isEditing={false}
            />
          )}
          {openAssignment && (
            <AdminAssignment
              assignmentId={currentAssignment}
              handleClose={() => setOpenAssignment((prev) => !prev)}
              courseId={courseData._id}
              courseTags={courseData.tags}
            />
          )}
        </div>
      </ContentContainer>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<AssignmentProps> = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
})(async ({ AuthUser, query }): Promise<{ props: AssignmentProps } | { notFound: true }> => {
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

export default withAuthUser<AssignmentProps>({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(Assignment);
