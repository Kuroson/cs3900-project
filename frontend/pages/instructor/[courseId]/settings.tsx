import React, { useState } from "react";
import { toast } from "react-toastify";
import Head from "next/head";
import { useRouter } from "next/router";
import GridViewIcon from "@mui/icons-material/GridView";
import HomeIcon from "@mui/icons-material/Home";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import SettingsIcon from "@mui/icons-material/Settings";
import { LoadingButton } from "@mui/lab";
import { Avatar, Button, TextField } from "@mui/material";
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
import { Nullable } from "util/util";

initAuth(); // SSR maybe, i think...

type UpdateSettingsPageProps = {
  courseData: UserCourseInformation;
};

const UpdateSettingsPage = ({ courseData }: UpdateSettingsPageProps): JSX.Element => {
  const user = useUser();
  const authUser = useAuthUser();
  const router = useRouter();
  const [loading, setLoading] = React.useState(user.userDetails === null);

  const [image, setImage] = useState<string>();
  const [code, setCode] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [session, setSession] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [tags, setTags] = useState<string>("");
  const [icon, setIcon] = useState<string>("");
  const [buttonLoading, setButtonLoading] = React.useState(false);

  React.useEffect(() => {
    console.log("courseData");
    console.log(courseData);

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
        setImage(reader.result as string);
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
    let dataPayload: UpdateCoursePayloadRequest = {
      courseId: courseData._id,
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

    console.log(dataPayload);

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

  const navRoutes: Routes[] = [
    {
      name: "Dashboard",
      route: "/instructor",
      icon: <HomeIcon fontSize="large" color="primary" />,
    },
    {
      name: "Home",
      route: `/instructor/${courseData._id}`,
      icon: <GridViewIcon fontSize="large" color="primary" />,
    },
    {
      name: "Course Info",
      route: `/instructor/${courseData._id}/settings`,
      icon: <SettingsIcon fontSize="large" color="primary" />,
    },
    {
      name: "Students",
      route: `/instructor/${courseData._id}/students`,
      icon: <PeopleAltIcon fontSize="large" color="primary" />,
      hasLine: true,
    },
    ...courseData.pages.map((page) => ({
      name: page.title,
      route: `/instructor/${courseData._id}/${page._id}`,
    })),
  ];

  return (
    <>
      <Head>
        <title>Admin page</title>
        <meta name="description" content="Home page" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <AdminNavBar userDetails={userDetails} routes={navRoutes} courseData={courseData} />
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
            <TextField
              id="Tags"
              label="Tags"
              variant="outlined"
              multiline
              rows={5}
              onChange={(e) => setTags(e.target.value)}
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

// export const getServerSideProps: GetServerSideProps = withAuthUserTokenSSR({
//   whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
// })(async ({ AuthUser }) => {
//   const [res, err] = await getUserDetails(await AuthUser.getIdToken(), AuthUser.email ?? "", "ssr");

//   if (res?.userDetails === null || res?.userDetails.role !== 0) {
//     return { notFound: true };
//   }

//   return {
//     props: {},
//   };
// });

export const getServerSideProps: GetServerSideProps<UpdateSettingsPageProps> = withAuthUserTokenSSR(
  {
    whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
  },
)(async ({ AuthUser, query }): Promise<{ props: UpdateSettingsPageProps } | { notFound: true }> => {
  const { courseId } = query;

  if (courseId === undefined || typeof courseId !== "string") {
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
