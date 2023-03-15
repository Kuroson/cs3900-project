import { useEffect, useState } from "react";
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
  coursesEnrolled: Array<any>;
}>;

type HomePageProps = {
  userDetails: UserDetailsPayload;
};

export type CourseInfo = {
  courseId: string;
  title: string;
  code: string;
  description: string;
  session: string;
  icon: string;
};

type coursesInfo = Array<CourseInfo>;

type coursesInfoPayload = {
  courses: coursesInfo;
};

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

const Admin = ({ userDetails }: HomePageProps): JSX.Element => {
  // const allCourses = courses;
  const authUser = useAuthUser();
  const router = useRouter();

  // const allCourses = userDetails.coursesEnrolled;
  const [allCourses, setAllCourses] = useState<coursesInfo>([]);
  const [showedCourses, setShowedCourses] = useState<coursesInfo>([]);
  const [code, setCode] = useState("");
  // search course id
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (allCourses != null) {
        setShowedCourses(allCourses.filter((course) => course.code.includes(code)));
      }
    }
  };

  // Fetch all this admin's courses
  useEffect(() => {
    const fetchData = async () => {
      const [data, err] = await apiGet<any, coursesInfoPayload>(
        `${PROCESS_BACKEND_URL}/course`,
        await authUser.getIdToken(),
        {},
      );

      if (err !== null) {
        console.error(err);
      }

      if (data === null) throw new Error("This shouldn't have happened");

      setAllCourses(data.courses);
      setShowedCourses(data.courses);
    };

    fetchData().catch(console.error);
  }, []);

  return (
    <>
      <Head>
        <title>Admin page</title>
        <meta name="description" content="Home page" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <SideNavbar
        firstName={userDetails.firstName}
        lastName={userDetails.lastName}
        role={getRoleName(userDetails.role)}
        avatarURL={userDetails.avatar}
        list={adminRoutes}
      />
      <ContentContainer>
        <div className="flex flex-col w-full justify-center px-[5%]">
          <h1 className="text-3xl w-full text-left border-solid border-t-0 border-x-0 border-[#EEEEEE]">
            <span className="ml-4">
              Welcome, {`${userDetails.firstName} ${userDetails.lastName}`}
            </span>
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
            {showedCourses?.map((course, index) => (
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
        userDetails: {
          email: null,
          firstName: null,
          lastName: null,
          role: null,
          avatar: null,
          coursesEnrolled: null,
        },
      },
    };
  }

  if (data === null) throw new Error("This shouldn't have happened");
  return {
    props: {
      userDetails: data,
    },
  };
});

export default withAuthUser<HomePageProps>({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
  // LoaderComponent: MyLoader,
})(Admin);
