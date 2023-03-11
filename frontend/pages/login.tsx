import React from "react";
import { toast } from "react-toastify";
import Head from "next/head";
import Link from "next/link";
import LoadingButton from "@mui/lab/LoadingButton";
import { TextField } from "@mui/material";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { AuthAction, withAuthUser } from "next-firebase-auth";
import { ContentContainer, Footer, SideNavbar } from "components";
import LeftSideBar from "components/Layout/Footer/LeftSideBar";

const LoginPage = (): JSX.Element => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleOnSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Don't reload page
    setLoading(true);
    await signInWithEmailAndPassword(getAuth(), email, password)
      .then((user) => {
        console.log("Signed in successfully", user);
      })
      .catch((err) => {
        // See error codes:
        // https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth#signinwithemailandpassword
        if (err?.code === "auth/invalid-email") {
          toast.error("Invalid email");
        } else if (err?.code === "auth/user-disabled") {
          toast.error("User disabled");
        } else if (err?.code === "auth/user-not-found") {
          toast.error("User not found");
        } else if (err?.code === "auth/wrong-password") {
          toast.error("Wrong password");
        } else {
          console.error(err);
          toast.error("Error Uncaught");
        }
      })
      .finally(() => setLoading(false));
  };

  return (
    <>
      <Head>
        <title>Login Page</title>
        <meta name="description" content="Login Page" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <SideNavbar empty={true} />
      <ContentContainer>
        <form
          className="w-full h-full flex flex-col items-center pt-[6rem]"
          onSubmit={handleOnSubmit}
        >
          <h1 className="text-6xl">Welcome to GitHappens!</h1>
          <div className="flex flex-col justify-between mt-10 w-[25rem]">
            <div>
              <TextField
                id="email-input"
                label="Email"
                type="text"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-[25rem]"
                autoComplete="email"
              />
            </div>
            <div className="pt-4">
              <TextField
                id="outlined-password-input"
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-[25rem]"
                autoComplete="new-password"
              />
            </div>
            <div className="mt-3">
              <Link href="/forgetPassword">
                <span className="underline text-base mx-1 py-1">Forget Password</span>
              </Link>
            </div>
            <div className="w-[25rem] my-4">
              <LoadingButton
                variant="contained"
                id="submit-form-button"
                className="w-[25rem]"
                type="submit"
                loading={loading}
              >
                Login
              </LoadingButton>
            </div>
            <div className="w-[25rem]">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="underline">
                Sign Up
              </Link>
            </div>
          </div>
        </form>
      </ContentContainer>
    </>
  );
};

export default withAuthUser({
  whenAuthed: AuthAction.REDIRECT_TO_APP,
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
})(LoginPage);
