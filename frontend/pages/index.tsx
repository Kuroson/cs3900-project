import { toast } from "react-toastify";
import Head from "next/head";
import { Button } from "@mui/material";
import { getAuth, signOut } from "firebase/auth";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { Footer, Header } from "components";
import { HttpException } from "util/HttpExceptions";
import { examplePost } from "util/api";
import initAuth from "util/firebase";

initAuth(); // SSR maybe, i think...

type HomePageProps = {
  email: string;
};

const HomePage = ({ email }: HomePageProps): JSX.Element => {
  console.log("On client side,", email);
  const authUser = useAuthUser();

  const handleBadRequest = async () => {
    const [res, err] = await examplePost(
      "http://localhost:8080/example",
      (await authUser.getIdToken()) as string,
      {},
    );

    if (err !== null) {
      // Post request did not succeed
      if (err instanceof HttpException) {
        toast.error(err.getMessage());
      } else {
        // Unknown error
        toast.error(err); // Probably do better error handling here
      }
      return;
    }
    if (res === null) throw new Error("Response and error are null"); // Actual error that should never happen
    toast.success(res.message);
  };

  const handleGoodRequest = async () => {
    const [res, err] = await examplePost(
      "http://localhost:8080/example",
      (await authUser.getIdToken()) as string,
      { message: "Hello from frontend!" },
    );

    if (err !== null) {
      // Post request did not succeed
      if (err instanceof HttpException) {
        toast.error(err.getMessage());
      } else {
        // Unknown error
        toast.error(err); // Probably do better error handling here
      }
      return;
    }
    if (res === null) throw new Error("Response and error are null"); // Actual error that should never happen
    toast.success(res.message);
  };

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
        <div className="flex flex-col items-center">
          <div className="w-[300px]">
            <Button
              variant="outlined"
              onClick={() => {
                signOut(getAuth());
              }}
            >
              Logout
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                console.log(authUser);
              }}
            >
              Debug
            </Button>

            <Button
              variant="outlined"
              onClick={() => {
                handleBadRequest();
              }}
            >
              Send bad example request
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                handleGoodRequest();
              }}
            >
              Send good example request
            </Button>
          </div>
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
