import React, { useState } from "react";
import { toast } from "react-toastify";
import Head from "next/head";
import { useRouter } from "next/router";
import { LoadingButton } from "@mui/lab";
import { Avatar, Button, FormControlLabel, Switch, TextField } from "@mui/material";
import { deepOrange } from "@mui/material/colors";
import { BasicCourseInfo, UserCourseInformation } from "models/course.model";
import { UserDetails } from "models/user.model";
import { GetServerSideProps } from "next";
import {
  AuthAction,
  useAuthUser,
  withAuthUser,
  withAuthUserSSR,
  withAuthUserTokenSSR,
} from "next-firebase-auth";
import { AdminNavBar, ContentContainer, Loading } from "components";
import { Routes, defaultAdminRoutes } from "components/Layout/NavBars/NavBar";
import { HttpException } from "util/HttpExceptions";
import { useUser } from "util/UserContext";
import { UpdateCoursePayloadRequest, createNewCourse, updateCourse } from "util/api/courseApi";
import { getUserCourseDetails } from "util/api/courseApi";
import { getUserDetails } from "util/api/userApi";
import initAuth from "util/firebase";
import { Nullable, adminRouteAccess } from "util/util";

initAuth(); // SSR maybe, i think...

type UpdateSettingsPageProps = {
  courseData: UserCourseInformation;
};

const UpdateSettingsPage = ({ courseData }: UpdateSettingsPageProps): JSX.Element => {
  const user = useUser();
  const authUser = useAuthUser();
  const router = useRouter();
  const [loading, setLoading] = React.useState(user.userDetails === null);

  const [code, setCode] = useState<string>(courseData.code);
  const [title, setTitle] = useState<string>(courseData.title);
  const [session, setSession] = useState<string>(courseData.session);
  const [description, setDescription] = useState<string>(courseData.description ?? "");
  const [tags, setTags] = useState<string>(courseData.tags.toString());
  const [archived, setArchived] = useState<boolean>(courseData.archived);
  const [icon, setIcon] = useState<string>(courseData.icon ?? "");
  const [buttonLoading, setButtonLoading] = React.useState(false);

  React.useEffect(() => {
    // Build user data for user context
    if (user.userDetails !== null) {
      setLoading(false);
    }
  }, [user.userDetails]);

  if (loading || user.userDetails === null) return <Loading />;
  const userDetails = user.userDetails as UserDetails;

  // upload image
  // TODO: Icons don't do anything atm. Probably should upload them to firebase storage and have a permanent public URL
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = () => {
        setIcon(reader.result as string);
      };
    }
  };

  // create course
  const handleUpdateCourse = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    if ([code, title, session, description, tags].every((x) => x.length === 0)) {
      toast.error("Please update at least one field");
      return;
    }
    const dataPayload: UpdateCoursePayloadRequest = {
      courseId: courseData._id,
      archived,
    };

    if (code !== "") {
      dataPayload.code = code;
    }

    if (title !== "") {
      dataPayload.title = title;
    }

    if (session !== "") {
      dataPayload.session = session;
    }

    if (description !== "") {
      dataPayload.description = description;
    }

    if (tags !== "") {
      const sendTags = tags.split(",");
      dataPayload.tags = sendTags;
    }

    if (icon !== "") {
      dataPayload.icon = icon;
    }

    setButtonLoading(true);
    const [res, err] = await updateCourse(await authUser.getIdToken(), dataPayload, "client");
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
    toast.success("Course updated successfully");

    router.push(`/instructor/${res.courseId}`);
  };

  return (
    <>
      <Head>
        <title>Admin page</title>
        <meta name="description" content="Home page" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <AdminNavBar userDetails={userDetails} courseData={courseData} />
      <ContentContainer>
        <div className="py-5 px-9">
          <h1>Update Course</h1>
          <p>Update any desired items in the course</p>
        </div>
        <form
          className="flex flex-col items-center justify-center gap-6"
          onSubmit={handleUpdateCourse}
        >
          <Avatar
            alt="Course"
            src={icon}
            sx={{ bgcolor: deepOrange[500], width: "100px", height: "100px" }}
          >
            C
          </Avatar>
          <Button variant="outlined" component="label">
            Upload Icon
            <input hidden accept="image/*" multiple type="file" onChange={handleImageChange} />
          </Button>
          <div className="flex flex-col gap-6 w-[600px]">
            <TextField
              id="Course ID"
              label="Course Code"
              variant="outlined"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <TextField
              id="Title"
              label="Course Title"
              variant="outlined"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <TextField
              id="Session"
              label="Course Session"
              variant="outlined"
              value={session}
              onChange={(e) => setSession(e.target.value)}
            />
            <TextField
              id="Description"
              label="Description"
              variant="outlined"
              multiline
              rows={9}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <TextField
              id="Tags"
              label="Tags"
              variant="outlined"
              multiline
              rows={5}
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
            <FormControlLabel
              control={
                <Switch checked={archived} onChange={(e) => setArchived(e.target.checked)} />
              }
              label="Archived"
            />
            <p style={{ textAlign: "right" }}>
              <i>Enter tags as comma separated list</i>
            </p>
            <LoadingButton variant="contained" fullWidth type="submit" loading={buttonLoading}>
              Update
            </LoadingButton>
          </div>
        </form>
      </ContentContainer>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<UpdateSettingsPageProps> = withAuthUserTokenSSR(
  {
    whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
  },
)(async ({ AuthUser, query }): Promise<{ props: UpdateSettingsPageProps } | { notFound: true }> => {
  const { courseId } = query;

  if (courseId === undefined || typeof courseId !== "string") {
    return { notFound: true };
  }

  if (!(await adminRouteAccess(await AuthUser.getIdToken(), AuthUser.email ?? ""))) {
    return { notFound: true };
  }

  const [courseDetails, courseDetailsErr] = await getUserCourseDetails(
    await AuthUser.getIdToken(),
    courseId as string,
    "ssr",
  );

  if (courseDetailsErr !== null) {
    console.error(courseDetailsErr);
    // handle error
    return { notFound: true };
  }

  if (courseDetails === null) throw new Error("This shouldn't have happened");

  return { props: { courseData: courseDetails } };
});

export default withAuthUser<UpdateSettingsPageProps>({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(UpdateSettingsPage);
