import React, { useEffect } from "react";
import { toast } from "react-toastify";
import dynamic from "next/dynamic";
import Head from "next/head";
import { ExpandMore } from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { AnalyticsSummaryType } from "models/analytics.model";
import { UserCourseInformation } from "models/course.model";
import { UserDetails } from "models/user.model";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { AdminNavBar, ContentContainer, Loading } from "components";
import AdminGradeTable from "components/analytics/AdminGradeTable";
import PageHeader from "components/common/PageHeader";
import ShowAnswer from "components/quiz/ShowAnswer";
import { HttpException } from "util/HttpExceptions";
import { useUser } from "util/UserContext";
import { getAnalyticsSummary } from "util/api/analyticsApi";
import { getUserCourseDetails } from "util/api/courseApi";
import initAuth from "util/firebase";
import { adminRouteAccess } from "util/util";

initAuth(); // SSR maybe, i think...

const Chart = dynamic(() => import("react-google-charts"), { ssr: false });

type AnalyticsProps = {
  courseData: UserCourseInformation;
};

const Analytics = ({ courseData }: AnalyticsProps): JSX.Element => {
  // TODO: Fix metadata thing
  const user = useUser();
  const authUser = useAuthUser();
  const [loading, setLoading] = React.useState(user.userDetails === null);
  const [summary, setSummary] = React.useState<AnalyticsSummaryType>();

  // Analytics information

  useEffect(() => {
    const getSummary = async () => {
      const [res, err] = await getAnalyticsSummary(
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
      setSummary(res);
    };

    // Fetch data
    getSummary();
  }, [authUser, courseData._id]);

  useEffect(() => {
    // Build user data for user context
    if (user.userDetails !== null) {
      setLoading(false);
    }
  }, [user.userDetails]);

  if (loading || user.userDetails === null) return <Loading />;
  const userDetails = user.userDetails as UserDetails;

  const organiseTags = (tagList: Record<string, number>) => {
    const keyList = [];
    keyList.push(["Tag", "Count"]);
    for (const [key, value] of Object.entries(tagList)) {
      keyList.push([key, value]);
    }

    return keyList;
  };

  return (
    <>
      <Head>
        <title>Analytics</title>
        <meta name="description" content="Analytics" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <AdminNavBar userDetails={userDetails} courseData={courseData} showAddPage={true} />
      <ContentContainer>
        <div className="flex flex-col w-full px-[5%] gap-9">
          <PageHeader title="Analytics" />

          <div className="py-4">
            <Accordion elevation={3} defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <h3>Grades</h3>
              </AccordionSummary>
              <AccordionDetails>
                {summary?.grades && (
                  <>
                    <AdminGradeTable tableTitle="Quiz" data={summary.grades} />
                    {/* <GradeTable
                      tableTitle="Assignment"
                      rows={organiseAssignmentGrades(grades.assignmentGrades)}
                    /> */}
                  </>
                )}
              </AccordionDetails>
            </Accordion>
            <Accordion elevation={3}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <h3>Topic Summary</h3>
              </AccordionSummary>
              <AccordionDetails>
                {summary?.tags && (
                  <div className="mx-auto flex space-between gap-9 w-full max-w-[800px]">
                    <div>
                      <Chart
                        chartType="PieChart"
                        data={organiseTags(summary.tags.successTags)}
                        options={{
                          title: "Success Topics",
                        }}
                        width={"100%"}
                        height={"250px"}
                      />
                    </div>
                    <div>
                      <Chart
                        chartType="PieChart"
                        data={organiseTags(summary.tags.improvementTags)}
                        options={{
                          title: "Improvement Topics",
                        }}
                        width={"100%"}
                        height={"250px"}
                      />
                    </div>
                  </div>
                )}
              </AccordionDetails>
            </Accordion>
            <Accordion elevation={3}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <h3>Incorrect Questions</h3>
              </AccordionSummary>
              <AccordionDetails>
                <div className="mt-7 mx-4 flex flex-col gap-9 w-full max-w-[800px]">
                  {summary?.questions &&
                    Object.keys(summary.questions).map((questionId, idx) => (
                      <ShowAnswer
                        questionInfo={summary.questions[questionId]}
                        key={`q_answer_${idx}`}
                        isAdmin={true}
                        answerCount={summary.questions[questionId].count}
                      />
                    ))}
                </div>
              </AccordionDetails>
            </Accordion>
          </div>
        </div>
      </ContentContainer>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<AnalyticsProps> = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
})(async ({ AuthUser, query }): Promise<{ props: AnalyticsProps } | { notFound: true }> => {
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

export default withAuthUser<AnalyticsProps>({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(Analytics);
