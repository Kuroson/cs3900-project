import Head from "next/head";
import { Button } from "@mui/material";
import { getAuth, signOut } from "firebase/auth";
import { GetServerSideProps } from "next";
import { AuthAction, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { Footer, Header } from "components";
import initAuth from "util/firebase";

initAuth(); // SSR maybe, i think...

type HomePageProps = {
  email: string;
};

const HomePage = ({ email }: HomePageProps): JSX.Element => {
  console.log("On client side,", email);
  return (
    <>
      <Head>
        <title>Home page</title>
        <meta name="description" content="Home page" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <Header />
      <div className="w-full flex flex-col px-[5%]">
        <h1 className="text-center pt-4 text-4xl">stuff {email}</h1>
        <div className="flex flex-row justify justify-center py-10">stuff</div>
        <div className="w-[100px]">
          <Button
            variant="contained"
            onClick={() => {
              signOut(getAuth());
            }}
          >
            Logout
          </Button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export const getServerSideProps: GetServerSideProps<HomePageProps> = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
})(async ({ AuthUser }): Promise<{ props: HomePageProps }> => {
  // Can already assume that they're authed
  // const history = await queryHistory(AuthUser.id as string);
  console.log("On server side,", AuthUser.email);
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
