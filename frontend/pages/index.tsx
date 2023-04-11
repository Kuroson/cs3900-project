/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Calendar, Views, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { toast } from "react-toastify";
import Head from "next/head";
import ExpandMore from "@mui/icons-material/ExpandMore";
import HomeIcon from "@mui/icons-material/Home";
import { Accordion, AccordionDetails, AccordionSummary, TextField } from "@mui/material";
import { UserEnrolmentInformation } from "models/enrolment.model";
import { UserDetails } from "models/user.model";
import moment from "moment";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { ContentContainer, Loading, StudentNavBar } from "components";
import { Routes } from "components/Layout/NavBars/NavBar";
import CourseCard from "components/common/CourseCard";
import { HttpException } from "util/HttpExceptions";
import { useUser } from "util/UserContext";
import { getUserDetails, getUserSchedule } from "util/api/userApi";
import initAuth from "util/firebase";

const localizer = momentLocalizer(moment);

initAuth(); // SSR maybe, i think...

interface ScheduleItem {
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource?: any;
  category: string;
}

export type Course = {
  courseId: string;
  code: string;
  title: string;
  description: string;
  session: string;
  icon: string;
};

type HomePageProps = {
  userDetails: UserDetails;
};

const HomePage = (): JSX.Element => {
  const user = useUser();
  const authUser = useAuthUser();
  const [loading, setLoading] = React.useState(user.userDetails !== null);
  const [searchCode, setSearchCode] = useState("");
  const [showedCourses, setShowedCourses] = useState<UserEnrolmentInformation[]>([]);
  const [archivedCourses, setArchivedCourses] = useState<UserEnrolmentInformation[]>([]);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);

  React.useEffect(() => {
    if (user.userDetails !== null) {
      setLoading(false);

      setShowedCourses([
        ...user.userDetails.enrolments.filter((course) => !course.course.archived),
      ]);
      setArchivedCourses([
        ...user.userDetails.enrolments.filter((course) => course.course.archived),
      ]);
    }
  }, [user.userDetails]);

  React.useEffect(() => {
    const getSchedule = async () => {
      const [res, err] = await getUserSchedule(await authUser.getIdToken(), "client");
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

      const constructScheduleItems: ScheduleItem[] = [];
      for (const item of res.deadlines) {
        if (item.type === "quiz") {
          constructScheduleItems.push({
            title: `${item.courseCode} ${item.type}: ${item.title}`,
            start: new Date(Date.parse(item.start)),
            end: new Date(Date.parse(item.deadline)),
            allDay: false,
            category: item.type,
          });
        } else if (item.type === "class") {
          constructScheduleItems.push({
            title: `${item.courseCode} ${item.type}: ${item.title}`,
            start: new Date(item.deadlineTimestamp * 1000),
            end: new Date(item.deadlineTimestamp * 1000),
            allDay: false,
            category: item.type,
          });
        } else {
          constructScheduleItems.push({
            title: `${item.courseCode} ${item.type}: ${item.title}`,
            start: new Date(Date.parse(item.deadline)),
            end: new Date(Date.parse(item.deadline)),
            allDay: false,
            category: item.type,
          });
        }
      }
      setScheduleItems(constructScheduleItems);
    };
    getSchedule();
  }, [authUser]);

  if (loading || user.userDetails === null) return <Loading />;
  const userDetails = user.userDetails as UserDetails;

  // search course id
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (userDetails.enrolments !== undefined) {
        setShowedCourses([
          ...userDetails.enrolments.filter(
            (course) => course.course.code.includes(searchCode) && !course.course.archived,
          ),
        ]);
      }
    }
  };
  console.log(userDetails.enrolments);
  const studentRoutes: Routes[] = [
    { name: "Dashboard", route: "/", icon: <HomeIcon fontSize="large" color="primary" /> },
    ...userDetails.enrolments.map((x) => {
      return {
        name: x.course.code,
        route: `/course/${x.course._id}`,
        // Icon: <HomeIcon fontSize="large" color="primary" />,
      };
    }),
  ];

  const eventStyleGetter = (event: ScheduleItem, start: Date, end: Date, isSelected: boolean) => {
    let backgroundColor = "";
    if (event.category === "class") {
      backgroundColor = "#26a69a"; // Teal
    } else if (event.category === "quiz") {
      backgroundColor = "#F97316"; // Orange
    } else if (event.category === "assignment") {
      backgroundColor = "#979091a7"; // Gray
    } else if (event.category === "workload") {
      backgroundColor = "black";
    }

    const style = {
      backgroundColor,
      borderRadius: "5px",
      opacity: 0.9,
      color: "white",
      border: "0px",
      display: "block",
    };

    return {
      style,
    };
  };

  return (
    <>
      <Head>
        <title>Home page</title>
        <meta name="description" content="Home page" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <StudentNavBar userDetails={userDetails} routes={studentRoutes} />
      <ContentContainer>
        <div className="flex flex-col w-full justify-center px-[5%]">
          <h1 className="text-3xl w-full text-left border-solid border-t-0 border-x-0 border-[#EEEEEE] mt-5">
            <span className="ml-4">
              Welcome, {`${userDetails.first_name} ${userDetails.last_name}`}
            </span>
          </h1>
          <div className="flex justify-between mx-6 mt-2">
            <h2>Course Overview</h2>
            <div className="">
              <TextField
                id="search course"
                label="Search Course Code"
                variant="outlined"
                sx={{ width: "300px" }}
                onKeyDown={handleKeyDown}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchCode(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-wrap w-full mx-3">
            {showedCourses?.map((x, index) => {
              return <CourseCard key={index} course={x.course} href={`/course/${x.course._id}`} />;
            })}
          </div>
          <div style={{ height: "500px" }} className="w-full my-5">
            <Calendar
              localizer={localizer}
              events={scheduleItems}
              views={[Views.MONTH, Views.WEEK, Views.AGENDA]}
              defaultView={Views.MONTH}
              startAccessor="start"
              endAccessor="end"
              eventPropGetter={eventStyleGetter}
            />
          </div>
          {archivedCourses.length > 0 && (
            <div>
              <Accordion elevation={3} className="mt-5 mb-5">
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <h3>Archived Courses</h3>
                </AccordionSummary>
                <AccordionDetails>
                  {archivedCourses?.map((x, index) => {
                    return (
                      <CourseCard key={index} course={x.course} href={`/course/${x.course._id}`} />
                    );
                  })}
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
  const [res, err] = await getUserDetails(await AuthUser.getIdToken(), AuthUser.email ?? "", "ssr");

  if (res?.userDetails !== null && res?.userDetails.role === 0) {
    // Instructor
    return {
      redirect: {
        destination: "/instructor",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
});

export default withAuthUser<HomePageProps>({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
  // LoaderComponent: MyLoader,
})(HomePage);
