import React from "react";
import { toast } from "react-toastify";
import Head from "next/head";
import { Button, TextField } from "@mui/material";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { AuthAction, useAuthUser, withAuthUser } from "next-firebase-auth";
import { Footer, Header } from "components";

const LoginPage = (): JSX.Element => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleOnSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Don't reload page
    console.log(email, password);
    await signInWithEmailAndPassword(getAuth(), email, password)
      .then((user) => {
        console.log("Signed in successfully", user);
      })
      .catch((err) => {
        console.error(err.message);
        toast.error(err.message);
      });
  };

  return (
    <>
      <Head>
        <title>Login Page</title>
        <meta name="description" content="Login Page" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <Header />
      <div className="w-full flex flex-col px-[5%]">
        <h1 className="text-center pt-4 text-4xl">Login Page</h1>
        <form className="flex flex-col justify justify-center py-10" onSubmit={handleOnSubmit}>
          <TextField
            id="email-input"
            label="Email"
            type="text"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            id="outlined-password-input"
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button variant="contained" type="submit" id="loginSubmissionButton">
            Login
          </Button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default withAuthUser({
  whenAuthed: AuthAction.REDIRECT_TO_APP,
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
})(LoginPage);
