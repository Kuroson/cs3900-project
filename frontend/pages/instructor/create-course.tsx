import React, { useState } from "react";
import { toast } from "react-toastify";
import Head from "next/head";
import { useRouter } from "next/router";
import { LoadingButton } from "@mui/lab";
import { Avatar, Button, TextField } from "@mui/material";
import { deepOrange } from "@mui/material/colors";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { AdminNavBar, ContentContainer, Loading } from "components";
import { defaultAdminRoutes } from "components/Layout/NavBars/NavBar";
import { HttpException } from "util/HttpExceptions";
import { useUser } from "util/UserContext";
import { CreateNewCoursePayloadRequest, createNewCourse } from "util/api/courseApi";
import initAuth from "util/firebase";
import { adminRouteAccess } from "util/util";
import { BasicCourseInfo } from "models/course.model";
import { KudosValuesType } from "models/kudosValue.model";
import { UserDetails } from "models/user.model";

initAuth(); // SSR maybe, i think...

const CreateCourse = (): JSX.Element => {
  const user = useUser();
  const authUser = useAuthUser();
  const router = useRouter();
  const [loading, setLoading] = React.useState(user.userDetails === null);

  const [code, setCode] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [session, setSession] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [icon, setIcon] = useState<string>("");
  const [buttonLoading, setButtonLoading] = React.useState(false);

  const [quizCompletionKudos, setQuizCompletionKudos] = React.useState<number>(100);
  const [assignmentCompletionKudos, setAssignmentCompletionKudos] = React.useState<number>(100);
  const [weeklyTaskCompletionKudos, setWeeklyTaskCompletionKudos] = React.useState<number>(100);
  const [forumPostKudos, setForumPostKudos] = React.useState<number>(100);
  const [forumPostAnswer, setForumPostAnswer] = React.useState<number>(100);
  const [forumPostCorrectAnswer, setForumPostCorrectAnswer] = React.useState<number>(100);
  const [attendance, setAttendance] = React.useState<number>(100);

  const [tags, setTags] = React.useState("");

  React.useEffect(() => {
    // Build user data for user context
    if (user.userDetails !== null) {
      setLoading(false);
    }
  }, [user.userDetails]);

  if (loading || user.userDetails === null) return <Loading />;
  const userDetails = user.userDetails as UserDetails;

  // upload image
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
  const handleCreateCourse = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    if ([code, title, session, description, tags].some((x) => x.length === 0)) {
      toast.error("Please fill out all fields");
      return;
    }

    const input = [
      quizCompletionKudos,
      assignmentCompletionKudos,
      weeklyTaskCompletionKudos,
      forumPostKudos,
      forumPostAnswer,
      forumPostCorrectAnswer,
      attendance,
    ];

    if (input.some((x) => isNaN(x))) {
      toast.error("Please fill out all fields");
      return;
    }

    const kudosValues: KudosValuesType = {
      quizCompletion: quizCompletionKudos,
      assignmentCompletion: assignmentCompletionKudos,
      weeklyTaskCompletion: weeklyTaskCompletionKudos,
      forumPostCreation: forumPostKudos,
      forumPostAnswer: forumPostAnswer,
      forumPostCorrectAnswer: forumPostCorrectAnswer,
      attendance: attendance,
    };

    const dataPayload: CreateNewCoursePayloadRequest = {
      code,
      title,
      session,
      description,
      icon,
      kudosValues,
      tags: tags.split(","),
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
      description: description,
      icon: icon,
      archived: false,
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
        <title>Create a new course</title>
        <meta name="description" content="Create a new course" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AdminNavBar userDetails={userDetails} routes={defaultAdminRoutes} />
      <ContentContainer>
        <div className="py-5 px-9 w-full flex justify-center">
          <h1 className="text-4xl">Create Course</h1>
        </div>
        <form
          className="flex flex-col items-center justify-center gap-6"
          onSubmit={handleCreateCourse}
        >
          <Avatar
            alt="Course"
            src={icon}
            sx={{ width: "100px", height: "100px", bgcolor: deepOrange[500] }}
          >
            C
          </Avatar>
          <Button variant="outlined" component="label">
            Upload Icon
            <input hidden accept="image/*" multiple type="file" onChange={handleImageChange} />
          </Button>
          <div className="w-full flex justify-center">
            <div className="flex flex-col gap-6 w-[600px] px-5">
              <TextField
                id="CourseCode"
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
              <LoadingButton
                variant="contained"
                fullWidth
                type="submit"
                loading={buttonLoading}
                id="create-course-button"
              >
                Create
              </LoadingButton>
            </div>
            <div className="flex flex-col gap-6 w-[600px] px-5">
              <TextField
                id="quizCompletionKudos"
                label="Quiz Completion Kudos"
                variant="outlined"
                value={quizCompletionKudos}
                onChange={(e) => setQuizCompletionKudos(parseInt(e.target.value))}
                type="number"
              />
              <TextField
                id="assignmentCompletionKudos"
                label="Assignment Completion Kudos"
                variant="outlined"
                value={assignmentCompletionKudos}
                onChange={(e) => setAssignmentCompletionKudos(parseInt(e.target.value))}
                type="number"
              />
              <TextField
                id="weeklyTaskCompletionKudos"
                label="Weekly Task Completion Kudos"
                variant="outlined"
                value={weeklyTaskCompletionKudos}
                onChange={(e) => setWeeklyTaskCompletionKudos(parseInt(e.target.value))}
                type="number"
              />
              <TextField
                id="forumPostKudos"
                label="Forum Post Kudos"
                variant="outlined"
                value={forumPostKudos}
                onChange={(e) => setForumPostKudos(parseInt(e.target.value))}
                type="number"
              />
              <TextField
                id="forumPostAnswer"
                label="Forum Post Answer Kudos"
                variant="outlined"
                value={forumPostAnswer}
                onChange={(e) => setForumPostAnswer(parseInt(e.target.value))}
                type="number"
              />
              <TextField
                id="forumPostCorrectAnswer"
                label="Forum Post Correct Answer Kudos"
                variant="outlined"
                value={forumPostCorrectAnswer}
                onChange={(e) => setForumPostCorrectAnswer(parseInt(e.target.value))}
                type="number"
              />
              <TextField
                id="attendance"
                label="Attendance Kudos"
                variant="outlined"
                value={attendance}
                onChange={(e) => setAttendance(parseInt(e.target.value))}
                type="number"
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
              <p style={{ textAlign: "right" }}>
                <i>Enter tags as comma separated list</i>
              </p>
            </div>
          </div>
        </form>
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
})(CreateCourse);
