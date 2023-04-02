/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Head from "next/head";
import dayjs from "dayjs";
import { AssignmentListType, CreateAssignmentType } from "models/assignment.model";
import { UserCourseInformation } from "models/course.model";
import { UserDetails } from "models/user.model";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { ContentContainer, Loading, StudentNavBar } from "components";
import StudentAssignment from "components/assignment/StudentAssignment";
import Card from "components/common/Card";
import PageHeader from "components/common/PageHeader";
import { HttpException } from "util/HttpExceptions";
import { useUser } from "util/UserContext";
import { getListOfAssignments } from "util/api/assignmentApi";
import { getUserCourseDetails } from "util/api/courseApi";
import initAuth from "util/firebase";

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
  const [openAssignment, setOpenAssignment] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState("");

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
        <link rel="icon" href="/favicon.png" />
      </Head>
      <StudentNavBar userDetails={userDetails} courseData={courseData} />
      <ContentContainer>
        <div className="flex flex-col w-full px-[5%] py-2">
          {!openAssignment && (
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
              </div>
            </>
          )}
          {openAssignment && (
            <StudentAssignment
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
