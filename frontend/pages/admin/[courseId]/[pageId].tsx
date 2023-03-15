import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import GridViewIcon from "@mui/icons-material/GridView";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { Button } from "@mui/material";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { ContentContainer, SideNavbar } from "components";
import { Routes } from "components/Layout/SideNavBar";
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

type PageProps = UserDetailsPayload & {
  courseId?: string;
  pageId?: string;
};

type courseInfo = {
  code: string;
  title: string;
  description: string;
  session: string;
  icon: string;
  pages: Array<{ title: string; pageId: string }>;
};
type coursesInfoPayload = courseInfo;

export type resources = {
  resourceId: string;
  title: string;
  description?: string;
  type: string;
  linkToResource: string;
};
export type sections = {
  sectionId: string;
  title: string;
  resources: resources[];
};

export type pageInfo = {
  title: string;
  courseId: string;
  pageId: string;
  resources: resources[];
  sections: sections[];
};
type pageInfoPayload = pageInfo;

const course: courseInfo = {
  code: "",
  title: "",
  description: "",
  session: "",
  icon: "",
  pages: [],
};

const page: pageInfo = {
  title: "Week1",
  courseId: "1",
  pageId: "1",
  resources: [],
  sections: [],
};

const SectionPage = ({
  firstName,
  lastName,
  email,
  role,
  avatar,
  courseId,
  pageId,
}: PageProps): JSX.Element => {
  const [courseInfo, setCourseInfo] = useState(course);
  const [pageInfo, setPageInfo] = useState(page);
  const authUser = useAuthUser();
  const router = useRouter();
  const courseRoutes: Routes[] = [
    {
      name: "Home",
      route: `/admin/${courseId}`,
      Icon: <GridViewIcon fontSize="large" color="primary" />,
    },
    {
      name: "Students",
      route: `/admin/${courseId}/students`,
      Icon: <PeopleAltIcon fontSize="large" color="primary" />,
      hasLine: true,
    },
  ];

  const pages = courseInfo.pages.map((page) => ({
    name: page.title,
    route: `/admin/${courseId}/${page.pageId}`,
  }));

  // Fetch all the course information
  useEffect(() => {
    const fetchCourseInfo = async () => {
      const [data, err] = await apiGet<any, coursesInfoPayload>(
        `${PROCESS_BACKEND_URL}/course/${courseId}`,
        await authUser.getIdToken(),
        {},
      );

      if (err !== null) {
        console.error(err);
      }

      if (data === null) throw new Error("This shouldn't have happened");

      setCourseInfo(data);
    };

    const fetchPageInfo = async () => {
      const [data, err] = await apiGet<any, pageInfoPayload>(
        `${PROCESS_BACKEND_URL}/page/${courseId}/${pageId}`,
        await authUser.getIdToken(),
        {},
      );

      if (err !== null) {
        console.error(err);
      }

      if (data === null) throw new Error("This shouldn't have happened");

      setPageInfo(data);
    };

    fetchCourseInfo().catch(console.error);
    fetchPageInfo().catch(console.error);
  }, [authUser, courseId, pageId]);
  // fetch all the section

  return (
    <>
      <Head>
        <title>Course page</title>
        <meta name="description" content="Home page" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <SideNavbar
        firstName={firstName}
        lastName={lastName}
        role={getRoleName(role)}
        avatarURL={avatar}
        list={courseRoutes.concat(pages)}
        isCoursePage={true}
        courseId={courseId}
        courseCode={courseInfo.code}
        courseIcon={courseInfo.icon}
      />
      <ContentContainer>
        <div className="flex flex-col w-full justify-center px-[5%]">
          <h1 className="text-3xl w-full border-solid border-t-0 border-x-0 border-[#EEEEEE] flex justify-between">
            <span className="ml-4">{pageInfo.title}</span>
            <Button>Edit</Button>
          </h1>
        </div>
      </ContentContainer>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<PageProps> = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
})(async ({ AuthUser, query }): Promise<{ props: PageProps }> => {
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
      courseId: query?.courseId as string,
      pageId: query?.pageId as string,
    },
  };
});

export default withAuthUser<PageProps>({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
  // LoaderComponent: MyLoader,
})(SectionPage);