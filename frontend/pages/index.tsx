import Head from "next/head";
import { TextField } from "@mui/material";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { ContentContainer, Footer, LeftSideBar, SideNavbar } from "components";
import CourseTile from "components/CourseTile";
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

type HomePageProps = UserDetailsPayload;

const HomePage = ({ firstName, lastName, email, role, avatar }: HomePageProps): JSX.Element => {
  const authUser = useAuthUser();
  console.log(firstName, lastName, email, role, avatar);

  return (
    <>
      <Head>
        <title>Home page</title>
        <meta name="description" content="Home page" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <SideNavbar
        firstName={firstName}
        lastName={lastName}
        role={getRoleName(role)}
        avatarURL={avatar}
      />
      <ContentContainer>
        <div className="flex flex-col w-full justify-center items-center px-[5%]">
          <h1 className="text-3xl w-full text-left border-solid border-t-0 border-x-0 border-[#EEEEEE]">
            <span className="ml-4">Welcome, {`${firstName} ${lastName}`}</span>
          </h1>
          <div className="w-full flex flex-col">
            <h2 className="text-2xl w-full ml-4 m-0">Course Overview</h2>
            <div className="ml-4 pt-5">
              <TextField id="outlined-search" label="Search field" type="search" />
            </div>
          </div>
        </div>
        <div className="flex flex-col w-full justify-left items-left px-[5%]">
        <div className="hello">
            <CourseTile
              courseName="Programming Fundamentals"
              courseCode="COMP1511"
              courseDescription="This course teaches basic programming"
            />
            <CourseTile
              courseName="Statistics and Probability"
              courseCode="MATH2089"
              courseDescription="This course teaches basic math"
            />
            <CourseTile
              courseName="Industrial Management"
              courseCode="MANF3500"
              courseDescription="This course teaches basic management and entrepreneurship principles"
            />
          </div>
        </div>
      </ContentContainer>
      <LeftSideBar />
      <Footer />
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
})(HomePage);
