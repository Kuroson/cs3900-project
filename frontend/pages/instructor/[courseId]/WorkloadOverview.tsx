import React from "react";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { AdminNavBar, ContentContainer, Loading, WorkloadSection } from "components";
import PageHeader from "components/common/PageHeader";
import { useUser } from "util/UserContext";
import { getUserCourseDetails } from "util/api/courseApi";
import { getWorkload } from "util/api/workloadApi";
import initAuth from "util/firebase";
import { adminRouteAccess } from "util/util";
import { UserCourseInformation } from "models/course.model";
import { UserDetails } from "models/user.model";
import { FullWorkloadInfo } from "models/workload.model";

initAuth();

type WorkloadOverviewPageProps = {
  courseData: UserCourseInformation;
  workloadData: FullWorkloadInfo;
};

const WorkloadOverviewPage = ({
  courseData,
  workloadData,
}: WorkloadOverviewPageProps): JSX.Element => {
  const user = useUser();
  const authUser = useAuthUser();
  const [loading, setLoading] = React.useState(user.userDetails === null);

  const [dynamicWeeks, setDynamicWeeks] = React.useState(workloadData.weeks);
  const [dynamicOnlineClasses, setDynamicOnlineClasses] = React.useState(courseData.onlineClasses);

  React.useEffect(() => {
    setDynamicWeeks(workloadData.weeks);
  }, [workloadData]);

  React.useEffect(() => {
    // Build user data for user context
    if (user.userDetails !== null) {
      setLoading(false);
    }
  }, [user.userDetails]);

  if (loading || user.userDetails === null) return <Loading />;
  const userDetails = user.userDetails as UserDetails;

  /**
   * Add a new button for Workload Overview
   */
  return (
    <>
      <Head>
        <title>Add Workload Overview</title>
        <meta name="description" content="Add Workload Overview" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AdminNavBar userDetails={userDetails} courseData={courseData} showAddPage={true} />
      <ContentContainer>
        <div className="flex flex-col w-full px-[5%] py-2">
          <h1 className="text-3xl w-ull border-solid border-t-0 border-x-0 border-[#EEEEEE] flex justify-between pt-3">
            <div className="flex items-center gap-4">
              <PageHeader title="Workload Overview" />
            </div>
          </h1>
          <WorkloadSection
            courseId={courseData._id}
            setWeeks={setDynamicWeeks}
            weeks={dynamicWeeks}
            onlineClasses={dynamicOnlineClasses}
            setOnlineClasses={setDynamicOnlineClasses}
          />
        </div>
      </ContentContainer>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<WorkloadOverviewPageProps> =
  withAuthUserTokenSSR({
    whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
  })(
    async ({
      AuthUser,
      query,
    }): Promise<{ props: WorkloadOverviewPageProps } | { notFound: true }> => {
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

      const [workloadDetails, workloadError] = await getWorkload(
        await AuthUser.getIdToken(),
        courseId as string,
        "ssr",
      );

      if (workloadError !== null) {
        console.error(workloadError);
        // handle error
        return { notFound: true };
      }

      if (workloadDetails === null) throw new Error("This shouldn't have happened");

      return {
        props: {
          courseData: courseDetails,
          workloadData: workloadDetails.workload,
        },
      };
    },
  );

export default withAuthUser<WorkloadOverviewPageProps>({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
  // LoaderComponent: MyLoader,
})(WorkloadOverviewPage);
