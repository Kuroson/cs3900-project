import Head from "next/head";
import { Button } from "@mui/material";
import { getAuth, signOut } from "firebase/auth";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { ContentContainer, Footer, LeftSideBar, SideNavbar } from "components";
import initAuth from "util/firebase";

initAuth(); // SSR maybe, i think...

type HomePageProps = {
  email: string;
};

const HomePage = ({ email }: HomePageProps): JSX.Element => {
  const authUser = useAuthUser();

  return (
    <>
      <Head>
        <title>Home page</title>
        <meta name="description" content="Home page" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <SideNavbar />
      <ContentContainer>
        <div>Stuff</div>
      </ContentContainer>
      <LeftSideBar />
      <Footer />
    </>
  );
};

export const getServerSideProps: GetServerSideProps<HomePageProps> = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
})(async ({ AuthUser }): Promise<{ props: HomePageProps }> => {
  return {
    props: {
      email: AuthUser.email as string,
    },
  };
});

export default withAuthUser<HomePageProps>({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
  // LoaderComponent: MyLoader,
})(HomePage);
