import Head from "next/head";
import { TextField } from "@mui/material";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { ContentContainer, Footer, LeftSideBar, SideNavbar } from "components";
import { PROCESS_BACKEND_URL, apiGet } from "util/api";
import initAuth from "util/firebase";
import { Nullable, getRoleName } from "util/util";
import HomeIcon from "@mui/icons-material/Home";
import { Routes } from "components/Layout/SideNavBar";

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

  const studentRoutes: Routes[] = [
    { name: "Dashboard", route: "/", Icon: <HomeIcon fontSize="large" color="primary" /> },
    { name: "COMP1511", route: "/COMP1511" },
    { name: "COMP6080", route: "/COMP6080" },
    { name: "MTRN2500", route: "/MTRN2500" },
  ];

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
        list={studentRoutes}
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
      </ContentContainer>
      {/* <Footer /> */}
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
