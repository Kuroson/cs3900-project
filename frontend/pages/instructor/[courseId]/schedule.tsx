import React from "react";
import { toast } from "react-toastify";
import Head from "next/head";
import { useRouter } from "next/router";
import { LoadingButton } from "@mui/lab";
import { TextField } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { UserCourseInformation } from "models/course.model";
import { UserDetails } from "models/user.model";
import moment from "moment";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { AdminNavBar, ContentContainer, Loading } from "components";
import { HttpException } from "util/HttpExceptions";
import { useUser } from "util/UserContext";
import { getUserCourseDetails } from "util/api/courseApi";
import { CreateOnlineClassPayloadRequest, createOnlineClass } from "util/api/onlineClassApi";
import initAuth from "util/firebase";
import { adminRouteAccess, youtubeURLParser } from "util/util";

initAuth(); // SSR maybe, i think...

type SchedulePageProps = {
  courseData: UserCourseInformation;
};

const SchedulePage = ({ courseData }: SchedulePageProps): JSX.Element => {
  const user = useUser();
  const authUser = useAuthUser();
  const router = useRouter();
  const [loading, setLoading] = React.useState(user.userDetails === null);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [startTime, setStartTime] = React.useState<number>(Date.now() / 1000);
  const [url, setUrl] = React.useState("");
  const [buttonLoading, setButtonLoading] = React.useState(false);

  React.useEffect(() => {
    // Build user data for user context
    if (user.userDetails !== null) {
      setLoading(false);
    }
  }, [user.userDetails]);

  if (loading || user.userDetails === null) return <Loading />;
  const userDetails = user.userDetails as UserDetails;

  const handleOnSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (title === "") {
      toast.warning("Please enter a title");
      return;
    }
    if (startTime === null) {
      toast.warning("Please enter a start time");
      return;
    }
    if (url === "" || youtubeURLParser(url) === false) {
      toast.warning("Please enter a valid YouTube URL link");
      return;
    }
    const payload: CreateOnlineClassPayloadRequest = {
      courseId: courseData._id,
      title,
      description,
      startTime,
      linkToClass: url,
    };
    setButtonLoading(true);
    const [res, err] = await createOnlineClass(await authUser.getIdToken(), payload, "client");
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
    toast.success("Successfully created online class");
    router.push(`/instructor/${courseData._id}`);
  };

  return (
    <>
      <Head>
        <title>Schedule New Lecture</title>
        <meta name="description" content="Schedule New Lecture" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <AdminNavBar userDetails={userDetails} courseData={courseData} showAddPage={true} />
      <ContentContainer>
        <div className="flex flex-col w-full justify-center px-[5%] items-center">
          <div className="py-5 flex flex-col items-center w-[1000px]">
            <h1 className="text-4xl font-bold">Schedule New Lecture</h1>
            <form
              className="py-5 w-full flex flex-col justify-center items-center"
              onSubmit={handleOnSubmit}
            >
              <div>
                <TextField
                  id="Title"
                  label="Title"
                  variant="outlined"
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-[600px]"
                  value={title}
                />
              </div>
              <div className="pt-5">
                <DateTimePicker
                  label="Date Time"
                  className="w-[600px]"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onChange={(e: any) => setStartTime(e.unix())}
                  value={moment.unix(startTime)}
                />
              </div>
              <div className="pt-5">
                <TextField
                  id="Link"
                  label="URL Link"
                  variant="outlined"
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-[600px]"
                  value={url}
                />
              </div>
              <div className="pt-5">
                <TextField
                  id="Description"
                  label="Description"
                  variant="outlined"
                  multiline
                  rows={9}
                  onChange={(e) => setDescription(e.target.value)}
                  value={description}
                  className="w-[600px]"
                />
              </div>
              <LoadingButton
                variant="contained"
                fullWidth
                type="submit"
                loading={buttonLoading}
                id="schedule-button"
                className="w-[600px] mt-5"
              >
                Create
              </LoadingButton>
            </form>
          </div>
        </div>
      </ContentContainer>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<SchedulePageProps> = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
})(async ({ AuthUser, query }): Promise<{ props: SchedulePageProps } | { notFound: true }> => {
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

export default withAuthUser<SchedulePageProps>({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
  // LoaderComponent: MyLoader,
})(SchedulePage);
