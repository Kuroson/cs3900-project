import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Head from "next/head";
import { useRouter } from "next/router";
import AddIcon from "@mui/icons-material/Add";
import { Avatar, Button, TextField } from "@mui/material";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { ContentContainer, SideNavbar } from "components";
import CourseCard from "components/common/CourseCard";
import { HttpException } from "util/HttpExceptions";
import { PROCESS_BACKEND_URL, apiGet, apiPost } from "util/api";
import initAuth from "util/firebase";
import { Nullable, getRoleName } from "util/util";
import { adminRoutes } from "./index";

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

type HomePageProps = UserDetailsPayload;

const CreateCourse = ({ firstName, lastName, email, role, avatar }: HomePageProps): JSX.Element => {
  const authUser = useAuthUser();
  const router = useRouter();
  const [image, setImage] = useState<string>();
  const [code, setCode] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [session, setSession] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [icon, setIcon] = useState<string>("");

  // upload image
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

    const [res, err] = await apiPost<CreateCoursePayload, any>(
      `${PROCESS_BACKEND_URL}/course`,
      await authUser.getIdToken(),
      {
        code,
        title,
        session,
        description,
        icon,
      },
    );

    if (err !== null) {
      console.error(err);
      if (err instanceof HttpException) {
        toast.error(err.message);
      } else {
        toast.error(err);
      }
    }

    if (res === null) throw new Error("Response and error are null"); // Actual error that should never happen
    router.push(`/admin/${res.courseId}`);
  };

  return (
    <>
      <Head>
        <title>Admin page</title>
        <meta name="description" content="Home page" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <SideNavbar
        firstName={firstName}
        lastName={lastName}
        role={getRoleName(role)}
        avatarURL={avatar}
        list={adminRoutes}
      />
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
            <Button variant="contained" fullWidth type="submit">
              Create
            </Button>
          </div>
        </form>
      </ContentContainer>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<HomePageProps> = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
})(async ({ AuthUser }): Promise<{ props: HomePageProps }> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, err] = await apiGet<any, UserDetailsPayload>(
    `${PROCESS_BACKEND_URL}/user/details`,
    await AuthUser.getIdToken(),
    {},
  );

  if (err !== null) {
    console.error(err);
    // handle error
    return {
      props: {
        email: null,
        firstName: null,
        lastName: null,
        role: null,
        avatar: null,
      },
    };
  }

  if (data === null) throw new Error("This shouldn't have happened");
  return {
    props: {
      ...data,
    },
  };
});

export default withAuthUser<HomePageProps>({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
  // LoaderComponent: MyLoader,
})(CreateCourse);
