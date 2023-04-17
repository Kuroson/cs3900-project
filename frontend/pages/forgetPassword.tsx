import React from "react";
import { toast } from "react-toastify";
import Head from "next/head";
import Link from "next/link";
import { LoadingButton } from "@mui/lab";
import { TextField } from "@mui/material";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { GetStaticProps } from "next";
import { AuthAction, withAuthUser } from "next-firebase-auth";
import { ContentContainer, EmptyNavBar } from "components";
import { CLIENT_BACKEND_URL } from "util/api/api";
import { isValidEmail } from "util/authVerficiation";

type ForgetPasswordPageProps = {
  CLIENT_BACKEND_URL: string;
};

const ForgetPasswordPage = (): JSX.Element => {
  const [email, setEmail] = React.useState("");
  const [emailError, setEmailError] = React.useState(false);

  const [loading, setLoading] = React.useState(false);

  const handleOnSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (email.length === 0) {
      toast.error("Please fill in your email");
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError(true);
      toast.info("Email is not valid!");
      return;
    }

    setLoading(true);
    // Send request to backendAPI;
    await sendPasswordResetEmail(getAuth(), email)
      .then((res) => {
        toast.success("Successfully sent password reset link");
      })
      .catch((err) => {
        if (err?.code === "auth/user-not-found") {
          toast.error("Email does not exist!");
        } else if (err?.code === "auth/too-many-requests") {
          toast.error("Too many requests! Please try again later");
        } else if (err?.code === "auth/invalid-email") {
          toast.error("Invalid email");
        } else {
          console.error(err);
          toast.error("Something went wrong! Please try again later");
        }
      });

    setLoading(false);
    return;
  };

  return (
    <>
      <Head>
        <title>Forget Password</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="Forget password page. Reset it here!" />
      </Head>
      <EmptyNavBar />
      <ContentContainer>
        <form
          className="w-full h-full flex flex-col items-center pt-[6rem]"
          onSubmit={handleOnSubmit}
        >
          <h1 className="text-6xl">Reset Password</h1>
          <div className="mt-10">
            <TextField
              id="email-input"
              label="Email"
              type="text"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-[25rem]"
              autoComplete="email"
              error={email.length !== 0 && emailError}
              onBlur={() => setEmailError(!isValidEmail(email))}
              helperText={email.length !== 0 && emailError && "Please enter a valid email"}
            />
          </div>
          <div className="w-[25rem] my-4">
            <LoadingButton
              variant="contained"
              id="submit-form-button"
              className="w-[25rem]"
              type="submit"
              loading={loading}
              color="primary"
            >
              Request Reset
            </LoadingButton>
          </div>
          <div className="flex">
            <Link href="/login">
              <span className="underline text-base mx-1 py-1">Back</span>
            </Link>
          </div>
        </form>
      </ContentContainer>
    </>
  );
};

export const getStaticProps: GetStaticProps<ForgetPasswordPageProps> = async () => {
  return {
    props: { CLIENT_BACKEND_URL },
  };
};

export default withAuthUser<ForgetPasswordPageProps>({
  whenAuthed: AuthAction.REDIRECT_TO_APP,
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
})(ForgetPasswordPage);
