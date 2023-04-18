import React, { useState } from "react";
import { toast } from "react-toastify";
import Head from "next/head";
import { useRouter } from "next/router";
import { LoadingButton } from "@mui/lab";
import { Avatar, Button, FormControlLabel, Switch, TextField } from "@mui/material";
import { deepOrange } from "@mui/material/colors";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { AdminNavBar, ContentContainer, Loading } from "components";
import { HttpException } from "util/HttpExceptions";
import { useUser } from "util/UserContext";
import { UpdateCoursePayloadRequest, updateCourse } from "util/api/courseApi";
import { getUserCourseDetails } from "util/api/courseApi";
import initAuth from "util/firebase";
import { adminRouteAccess } from "util/util";
import { UserCourseInformation } from "models/course.model";
import { KudosValuesType } from "models/kudosValue.model";
import { UserDetails } from "models/user.model";

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

  const kudos = courseData.kudosValues;

  const [quizCompletionKudos, setQuizCompletionKudos] = React.useState<number>(
    kudos.quizCompletion,
  );
  const [assignmentCompletionKudos, setAssignmentCompletionKudos] = React.useState<number>(
    kudos.assignmentCompletion,
  );
  const [weeklyTaskCompletionKudos, setWeeklyTaskCompletionKudos] = React.useState<number>(
    kudos.weeklyTaskCompletion,
  );
  const [forumPostKudos, setForumPostKudos] = React.useState<number>(kudos.forumPostCreation);
  const [forumPostAnswer, setForumPostAnswer] = React.useState<number>(kudos.forumPostAnswer);
  const [forumPostCorrectAnswer, setForumPostCorrectAnswer] = React.useState<number>(
    kudos.forumPostCorrectAnswer,
  );
  const [attendance, setAttendance] = React.useState<number>(kudos.attendance);

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

    const dataPayload: UpdateCoursePayloadRequest = {
      courseId: courseData._id,
      archived,
      kudosValues: kudosValues,
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
        <title>Update Course Details</title>
        <meta name="description" content="Update course details page" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AdminNavBar userDetails={userDetails} courseData={courseData} showAddPage={true} />
      <ContentContainer>
        <div className="py-5 px-9 w-full flex flex-col">
          <h1 className="text-center text-4xl">Update Course</h1>
          <p className="text-center">Update any desired items in the course</p>
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
          <div className="w-full flex justify-center">
            <div className="flex flex-col gap-6 w-[600px] px-5">
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

              <FormControlLabel
                control={
                  <Switch checked={archived} onChange={(e) => setArchived(e.target.checked)} />
                }
                label="Archived"
              />
              <LoadingButton variant="contained" fullWidth type="submit" loading={buttonLoading}>
                Update
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
