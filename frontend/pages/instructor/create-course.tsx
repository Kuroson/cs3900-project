import React, { useState } from "react";
import { toast } from "react-toastify";
import Head from "next/head";
import { useRouter } from "next/router";
import { LoadingButton } from "@mui/lab";
import { Avatar, Button, TextField } from "@mui/material";
import { BasicCourseInfo } from "models/course.model";
import { UserDetails } from "models/user.model";
import { AuthAction, useAuthUser, withAuthUser } from "next-firebase-auth";
import { AdminNavBar, ContentContainer } from "components";
import { defaultAdminRoutes } from "components/Layout/NavBars/NavBar";
import { HttpException } from "util/HttpExceptions";
import { useUser } from "util/UserContext";
import { createNewCourse } from "util/api/courseApi";
import { getUserDetails } from "util/api/userApi";
import initAuth from "util/firebase";
import { Nullable } from "util/util";

initAuth(); // SSR maybe, i think...

type UserDetailsPayload = Nullable<{
  firstName: string;
  lastName: string;
  email: string;
  role: number;
  avatar: string;
}>;

type CreateCoursePayload = Nullable<{
  code: string;
  title: string;
  description: string;
  session: string;
  icon: string;
}>;

const CreateCourse = (): JSX.Element => {
  const user = useUser();
  const authUser = useAuthUser();
  const router = useRouter();
  const [loading, setLoading] = React.useState(user.userDetails === null);

  const [image, setImage] = useState<string>();
  const [code, setCode] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [session, setSession] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [icon, setIcon] = useState<string>("");
  const [buttonLoading, setButtonLoading] = React.useState(false);

  React.useEffect(() => {
    // Build user data for user context
    const fetchUserData = async () => {
      const [resUserData, errUserData] = await getUserDetails(
        await authUser.getIdToken(),
        authUser.email ?? "bad",
        "client",
      );

      if (errUserData !== null) {
        throw errUserData;
      }

      if (resUserData === null) throw new Error("This shouldn't have happened");
      return resUserData;
    };

    if (user.userDetails === null) {
      fetchUserData()
        .then((res) => {
          if (user.setUserDetails !== undefined) {
            user.setUserDetails(res.userDetails);
          }
        })
        .then(() => setLoading(false))
        .catch((err) => {
          toast.error("failed to fetch shit");
        });
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading || user.userDetails === null) return <div>Loading...</div>;
  const userDetails = user.userDetails as UserDetails;

  // upload image
  // TODO: Icons don't do anything atm. Probably should upload them to firebase storage and have a permanent public URL
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = () => {
        setImage(reader.result as string);
      };
    }
  };

  // create course
  const handleCreateCourse = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    if ([code, title, session, description].some((x) => x.length === 0)) {
      toast.error("Please fill out all fields");
      return;
    }
    const dataPayload = {
      code,
      title,
      session,
      description,
      icon,
    };
    setButtonLoading(true);
    const [res, err] = await createNewCourse(await authUser.getIdToken(), dataPayload, "client");
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
    if (res === null) throw new Error("Response and error are null"); // Actual error that should never happen
    setButtonLoading(false);
    // Update global state with new course
    const newCourse: BasicCourseInfo = {
      _id: res.courseId,
      code: code,
      title: title,
      session: session,
    };
    toast.success("Course created successfully");
    if (userDetails === null) {
      // Don't do it, bc its null?
    }

    user.setUserDetails({
      ...userDetails,
      created_courses: [...userDetails.created_courses, newCourse],
    });
    router.push(`/instructor/${res.courseId}`);
  };

  return (
    <>
      <Head>
        <title>Admin page</title>
        <meta name="description" content="Home page" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <AdminNavBar userDetails={userDetails} routes={defaultAdminRoutes} />
      <ContentContainer>
        <div className="py-5 px-9">
          <h1>Create Course</h1>
        </div>
        <form
          className="flex flex-col items-center justify-center gap-6"
          onSubmit={handleCreateCourse}
        >
          <Avatar
            alt="Course"
            src={image != null ? image : "/static/images/avatar/3.jpg"}
            sx={{ width: "100px", height: "100px" }}
          />
          <Button variant="outlined" component="label">
            Upload Icon
            <input hidden accept="image/*" multiple type="file" onChange={handleImageChange} />
          </Button>
          <div className="flex flex-col gap-6 w-[600px]">
            <TextField
              id="Course ID"
              label="Course Code"
              variant="outlined"
              onChange={(e) => setCode(e.target.value)}
            />
            <TextField
              id="Title"
              label="Course Title"
              variant="outlined"
              onChange={(e) => setTitle(e.target.value)}
            />
            <TextField
              id="Session"
              label="Course Session"
              variant="outlined"
              onChange={(e) => setSession(e.target.value)}
            />
            <TextField
              id="Description"
              label="Description"
              variant="outlined"
              multiline
              rows={9}
              onChange={(e) => setDescription(e.target.value)}
            />
            <LoadingButton variant="contained" fullWidth type="submit" loading={buttonLoading}>
              Create
            </LoadingButton>
          </div>
        </form>
      </ContentContainer>
    </>
  );
};

export default withAuthUser({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
  // LoaderComponent: MyLoader,
})(CreateCourse);
