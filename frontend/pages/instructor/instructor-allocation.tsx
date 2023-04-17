import React from "react";
import { toast } from "react-toastify";
import Head from "next/head";
import { LoadingButton } from "@mui/lab";
import { TextField } from "@mui/material";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { AdminNavBar, ContentContainer, Loading } from "components";
import { defaultAdminRoutes } from "components/Layout/NavBars/NavBar";
import { HttpException } from "util/HttpExceptions";
import { useUser } from "util/UserContext";
import { adminInstructorSet } from "util/api/userApi";
import initAuth from "util/firebase";
import { adminRouteAccess } from "util/util";
import { UserDetails } from "models/user.model";

initAuth(); // SSR maybe, i think...

const InstructorAllocationPage = (): JSX.Element => {
  const user = useUser();
  const authUser = useAuthUser();
  const [loading, setLoading] = React.useState(user.userDetails === null);

  const [email, setEmail] = React.useState("");
  const [buttonLoading, setButtonLoading] = React.useState(false);

  React.useEffect(() => {
    // Build user data for user context
    if (user.userDetails !== null) {
      setLoading(false);
    }
  }, [user.userDetails]);

  if (loading || user.userDetails === null) return <Loading />;
  const userDetails = user.userDetails as UserDetails;

  const handleOnPromote = async () => {
    if (buttonLoading) return;
    if (email === "") {
      toast.warning("Please fill in the email");
      return;
    }
    const [res, err] = await adminInstructorSet(await authUser.getIdToken(), email, true, "client");
    if (err !== null) {
      console.error(err);
      if (err instanceof HttpException) {
        toast.error(err.message);
      } else {
        toast.error(err);
      }
      setButtonLoading(false);
      return;
    }
    if (res === null) throw new Error("Res should not have been null");
    setButtonLoading(false);
    toast.success(res.message);
    setEmail("");
  };

  const handleOnDemote = async () => {
    if (buttonLoading) return;
    if (email === "") {
      toast.warning("Please fill in the email");
      return;
    }
    const [res, err] = await adminInstructorSet(
      await authUser.getIdToken(),
      email,
      false,
      "client",
    );
    if (err !== null) {
      console.error(err);
      if (err instanceof HttpException) {
        toast.error(err.message);
      } else {
        toast.error(err);
      }
      setButtonLoading(false);
      return;
    }
    if (res === null) throw new Error("Res should not have been null");
    setButtonLoading(false);
    toast.success(res.message);
    setEmail("");
  };

  return (
    <>
      <Head>
        <title>Instructor Allocation</title>
        <meta name="description" content="Instructor Allocation Page" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AdminNavBar userDetails={userDetails} routes={defaultAdminRoutes} />
      <ContentContainer>
        <div className="flex flex-col w-full justify-center px-[5%] items-center">
          <div className="py-5 flex flex-col items-center w-[1000px]">
            <h1 className="text-4xl font-bold">Instructor Allocation</h1>
            <div className="pt-8 w-full flex justify-center items-center flex-col">
              <TextField
                id="email"
                label="Email"
                variant="outlined"
                value={email}
                className="w-[20rem]"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="pt-10 flex w-full justify-center">
              <LoadingButton
                variant="contained"
                type="submit"
                loading={buttonLoading}
                className="mr-5"
                onClick={handleOnPromote}
              >
                Promote
              </LoadingButton>
              <LoadingButton
                variant="contained"
                type="submit"
                loading={buttonLoading}
                onClick={handleOnDemote}
              >
                Demote
              </LoadingButton>
            </div>
          </div>
        </div>
      </ContentContainer>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
})(async ({ AuthUser }) => {
  if (!(await adminRouteAccess(await AuthUser.getIdToken(), AuthUser.email ?? ""))) {
    return { notFound: true };
  }

  return {
    props: {},
  };
});

export default withAuthUser({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
  // LoaderComponent: MyLoader,
})(InstructorAllocationPage);
