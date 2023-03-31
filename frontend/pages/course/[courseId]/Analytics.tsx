/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import Chart from "react-google-charts";
import { toast } from "react-toastify";
import Head from "next/head";
import { ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import {
  AnalyticsGradesType,
  AnalyticsQuestionsType,
  AnalyticsTagSummaryType,
} from "models/analytics.model";
import { UserCourseInformation } from "models/course.model";
import { UserDetails } from "models/user.model";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { AdminNavBar, ContentContainer, Loading, StudentNavBar } from "components";
import PageHeader from "components/common/PageHeader";
import ShowAnswer from "components/quiz/ShowAnswer";
import { HttpException } from "util/HttpExceptions";
import { useUser } from "util/UserContext";
import {
  getAnalyticsGrades,
  getAnalyticsQuestions,
  getAnalyticsTagsSummary,
} from "util/api/analyticsApi";
import { getUserCourseDetails } from "util/api/courseApi";
import initAuth from "util/firebase";

initAuth(); // SSR maybe, i think...

type AnalyticsProps = {
  courseData: UserCourseInformation;
};

const Analytics = ({ courseData }: AnalyticsProps): JSX.Element => {
  // TODO: Fix metadata thing
  const user = useUser();
  const authUser = useAuthUser();
  const [loading, setLoading] = React.useState(user.userDetails === null);

  // Analytics information
  const [grades, setGrades] = React.useState<AnalyticsGradesType>();
  const [tagsSummary, setTagsSummary] = React.useState<AnalyticsTagSummaryType>();
  const [questions, setQuestions] = React.useState<AnalyticsQuestionsType>();

  useEffect(() => {
    const getGrades = async () => {
      const [res, err] = await getAnalyticsGrades(
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
      setGrades(res);
    };

    const getTagsSummary = async () => {
      const [res, err] = await getAnalyticsTagsSummary(
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
      setTagsSummary(res);
    };

    const getQuestions = async () => {
      const [res, err] = await getAnalyticsQuestions(
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
      setQuestions(res);
    };

    // Fetch data
    getGrades();
    getTagsSummary();
    getQuestions();
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
      <StudentNavBar userDetails={userDetails} courseData={courseData} />
      <ContentContainer>
        <div className="flex flex-col w-full px-[5%] gap-9">
          <PageHeader title="Analytics" />

          <div className="py-4">
            <Accordion elevation={3} defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>
                  <h3>Grades</h3>
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <div className="mb-3 flex gap-9 w-full max-w-[800px]">
                  <Typography>
                    <h4>
                      <i>Quiz Grades</i>
                    </h4>
                  </Typography>
                </div>
                <div className="mt-2 mb-5 flex flex-col items-center gap-9 w-full">
                  <TableContainer sx={{ width: "90%" }} component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <b>Quiz</b>
                          </TableCell>
                          <TableCell align="center">
                            <b>Mark Awarded</b>
                          </TableCell>
                          <TableCell align="center">
                            <b>Maximum Mark</b>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {grades?.quizGrades.map((row) => (
                          <TableRow
                            key={row.quizId}
                            sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                          >
                            <TableCell component="th" scope="row">
                              {row.title}
                            </TableCell>
                            <TableCell align="center">{row.marksAwarded ?? "?"}</TableCell>
                            <TableCell align="center">{row.maxMarks}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </div>

                <div className="mb-3 flex gap-9 w-full max-w-[800px]">
                  <h4>
                    <i>Assignment Grades</i>
                  </h4>
                </div>
                <div className="mt-2 mb-5 flex flex-col items-center gap-9 w-full">
                  <TableContainer sx={{ width: "90%" }} component={Paper}>
                    <Table sx={{ width: 650 }} aria-label="simple table">
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <b>Assignment</b>
                          </TableCell>
                          <TableCell align="center">
                            <b>Mark Awarded</b>
                          </TableCell>
                          <TableCell align="center">
                            <b>Maximum Mark</b>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {grades?.assignmentGrades.map((row) => (
                          <TableRow
                            key={row.assignmentId}
                            sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                          >
                            <TableCell component="th" scope="row">
                              {row.title}
                            </TableCell>
                            <TableCell align="center">{row.marksAwarded ?? "?"}</TableCell>
                            <TableCell align="center">{row.maxMarks}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </div>
              </AccordionDetails>
            </Accordion>
            <Accordion elevation={3}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>
                  <h3>Tag Summary</h3>
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {tagsSummary && (
                  <div className="mt-7 mx-auto flex gap-9 w-full max-w-[800px]">
                    <div>
                      <Chart
                        chartType="PieChart"
                        data={organiseTags(tagsSummary.successTags)}
                        options={{
                          title: "Success Tags",
                        }}
                        width={"100%"}
                        height={"400px"}
                      />
                    </div>
                    <div>
                      <Chart
                        chartType="PieChart"
                        data={organiseTags(tagsSummary.improvementTags)}
                        options={{
                          title: "Improvement Tags",
                        }}
                        width={"100%"}
                        height={"400px"}
                      />
                    </div>
                  </div>
                )}
              </AccordionDetails>
            </Accordion>
            <Accordion elevation={3}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>
                  <h3>Incorrect Questions</h3>
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <div className="mt-7 mx-4 flex flex-col gap-9 w-full max-w-[800px]">
                  {questions &&
                    questions.questions.map((question, idx) => (
                      <ShowAnswer questionInfo={question} key={`q_answer_${idx}`} isAdmin={false} />
                    ))}
                </div>
              </AccordionDetails>
            </Accordion>
          </div>
          {/* <div className="flex flex-wrap mt-10"> */}
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
