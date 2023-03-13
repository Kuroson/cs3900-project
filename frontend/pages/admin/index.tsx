import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import AddIcon from "@mui/icons-material/Add";
import HomeIcon from "@mui/icons-material/Home";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import { TextField } from "@mui/material";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { ContentContainer, SideNavbar } from "components";
import { Routes } from "components/Layout/SideNavBar";
import CourseCard from "components/common/CourseCard";
import { PROCESS_BACKEND_URL, apiGet } from "util/api";
import initAuth from "util/firebase";
import { Nullable, getRoleName } from "util/util";

initAuth(); // SSR maybe, i think...

type UserDetailsPayload = Nullable<{
  firstName: string;
  lastName: string;
  email: string;
  role: number;
  avatar: string;
}>;

export type Course = {
  courseId: string;
  code: string;
  title: string;
  description: string;
  session: string;
  icon: string;
};

type HomePageProps = UserDetailsPayload;

const courses: Course[] = [
  {
    courseId: "1",
    title: "Programming Fundamentals",
    code: "COMP1511",
    description:
      "An introduction to problem-solving via programming, which aims to have students develop proficiency in using a high level programming language. Topics: algorithms, program structures (statements, sequence, selection, iteration, functions), data types (numeric, character), data structures (arrays, tuples, pointers, lists), storage structures (memory, addresses), introduction to analysis of algorithms, testing, code quality, teamwork, and reflective practice. The course includes extensive practical work in labs and programming projects.",
    session: "23T1",
    icon: "",
  },
  {
    courseId: "2",
    title: "Programming Fundamentals",
    code: "COMP1521",
    description:
      "An introduction to problem-solving via programming, which aims to have students develop proficiency in using a high level programming language. Topics: algorithms, program structures (statements, sequence, selection, iteration, functions), data types (numeric, character), data structures (arrays, tuples, pointers, lists), storage structures (memory, addresses), introduction to analysis of algorithms, testing, code quality, teamwork, and reflective practice. The course includes extensive practical work in labs and programming projects.",
    session: "22T2",
    icon: "",
  },
  {
    courseId: "3",
    title: "Programming Fundamentals",
    code: "COMP1531",
    description:
      "An introduction to problem-solving via programming, which aims to have students develop proficiency in using a high level programming language. Topics: algorithms, program structures (statements, sequence, selection, iteration, functions), data types (numeric, character), data structures (arrays, tuples, pointers, lists), storage structures (memory, addresses), introduction to analysis of algorithms, testing, code quality, teamwork, and reflective practice. The course includes extensive practical work in labs and programming projects.",
    session: "21T3",
    icon: "",
  },
];

export const adminRoutes: Routes[] = [
  { name: "Dashboard", route: "/admin", Icon: <HomeIcon fontSize="large" color="primary" /> },
  {
    name: "Admin allocation",
    route: "/admin/admin-allocation",
    Icon: <SupervisorAccountIcon fontSize="large" color="primary" />,
  },
  {
    name: "Create Course",
    route: "/admin/create-course",
    Icon: <AddIcon fontSize="large" color="primary" />,
  },
];

const Admin = ({ firstName, lastName, email, role, avatar }: HomePageProps): JSX.Element => {
  const allCourses = courses;
  const [showedCourses, setShowedCourses] = useState(courses);
  const [code, setCode] = useState("");
  const authUser = useAuthUser();
  const router = useRouter();

  // search course id
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setShowedCourses(allCourses.filter((course) => course.code.includes(code)));
    }
  };

  return (
    <>
      <Head>
        <title>Admin page</title>
        <meta name="description" content="Home page" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <SideNavbar
        firstName={firstName}
        lastName={lastName}
        role={getRoleName(role)}
        avatarURL={avatar}
        list={adminRoutes}
      />
      <ContentContainer>
        <div className="flex flex-col w-full justify-center px-[5%]">
          <h1 className="text-3xl w-full text-left border-solid border-t-0 border-x-0 border-[#EEEEEE]">
            <span className="ml-4">Welcome, {`${firstName} ${lastName}`}</span>
          </h1>
          {/* admin dashboard */}
          <div className="flex justify-between mx-6">
            <h2>Course Overview</h2>
            <TextField
              id="search course"
              label="Search Course Code"
              variant="outlined"
              sx={{ width: "300px" }}
              onKeyDown={handleKeyDown}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCode(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap w-full mx-3">
            {showedCourses.map((course, index) => (
              <CourseCard key={index} course={course} href={`/admin/${course.courseId}`} />
            ))}
            <div
              className="flex flex-col rounded-lg shadow-md p-5 my-2 mx-5 w-[370px] h-[264px] cursor-pointer hover:shadow-lg items-center justify-center"
              onClick={() => router.push("/admin/create-course")}
            >
              <AddIcon fontSize="large" color="primary" />
            </div>
          </div>
        </div>
      </ContentContainer>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<HomePageProps> = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
})(async ({ AuthUser }): Promise<{ props: HomePageProps }> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, err] = await apiGet<any, UserDetailsPayload>(
    `${PROCESS_BACKEND_URL}/user/details`,
    await AuthUser.getIdToken(),
    {},
  );

  if (err !== null) {
    console.error(err);
    // handle error
    return {
      props: {
        email: null,
        firstName: null,
        lastName: null,
        role: null,
        avatar: null,
      },
    };
  }

  if (data === null) throw new Error("This shouldn't have happened");
  return {
    props: {
      ...data,
    },
  };
});

export default withAuthUser<HomePageProps>({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
  // LoaderComponent: MyLoader,
})(Admin);
