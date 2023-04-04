/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { toast } from "react-toastify";
import Head from "next/head";
import { LoadingButton } from "@mui/lab";
import { Button, TextField } from "@mui/material";
import { UserCourseInformation } from "models/course.model";
import { FullPostInfo } from "models/post.model";
import { FullResponseInfo } from "models/response.model";
import { UserDetails } from "models/user.model";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import {
  AdminNavBar,
  ContentContainer,
  ForumPostOverviewCard,
  Loading,
  ThreadCreationModal,
} from "components";
import ForumPostCard from "components/common/ForumPostCard";
import ForumResponseCard from "components/common/ForumResponseCard";
import { HttpException } from "util/HttpExceptions";
import { useUser } from "util/UserContext";
import { getUserCourseDetails } from "util/api/courseApi";
import {
  CreateNewForumReplyPayloadRequest,
  createNewPost,
  createNewResponse,
  markCorrectResponse,
} from "util/api/forumApi";
import initAuth from "util/firebase";
import { fileToDataUrl } from "util/util";

initAuth(); // SSR maybe, i think...

type ForumPageProps = {
  courseData: UserCourseInformation;
};

type ThreadListColumnProps = {
  courseId: string;
  userDetails: UserDetails;
  postList: FullPostInfo[];
  setPostList: React.Dispatch<React.SetStateAction<FullPostInfo[]>>;
  setShowedPost: React.Dispatch<React.SetStateAction<FullPostInfo | null>>;
};

const ThreadListColumn = ({
  courseId,
  userDetails,
  postList,
  setPostList,
  setShowedPost,
}: ThreadListColumnProps): JSX.Element => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);

  return (
    <div>
      <div className="flex rounded-lg my-5 mx-5 w-[300px] items-center justify-center">
        <Button variant="contained" onClick={handleOpen} id="addNewPost" className="w-full">
          New Thread
        </Button>
      </div>
      <ThreadCreationModal
        open={open}
        setOpen={setOpen}
        courseId={courseId}
        userDetails={userDetails}
        setPostList={setPostList}
      />
      <div className="overflow-y-auto h-[700px]">
        {postList.map((post, index) => (
          <div key={index} onClick={() => setShowedPost(post)}>
            <ForumPostOverviewCard post={post} />
          </div>
        ))}
      </div>
    </div>
  );
};

type CorrectResponseButtonProps = {
  resp: FullResponseInfo;
  setShowedPost: React.Dispatch<React.SetStateAction<FullPostInfo | null>>;
  showedPost: FullPostInfo | null;
};

const CorrectResponseButton = ({
  resp,
  setShowedPost,
  showedPost,
}: CorrectResponseButtonProps): JSX.Element => {
  const authUser = useAuthUser();

  const handleCorrectResponse = async (e: React.SyntheticEvent, response: FullResponseInfo) => {
    e.preventDefault();
    if (showedPost === null) return;

    const [res, err] = await markCorrectResponse(await authUser.getIdToken(), resp._id, "client");
    if (err !== null) {
      console.error(err);
      if (err instanceof HttpException) {
        toast.error(err.message);
      } else {
        toast.error(err);
      }
      return;
    }
    if (res === null) throw new Error("Didn't save the correct state correctly"); // Actual error that should never happen

    // Update global state with new response state
    const newResponses = [
      ...showedPost.responses.filter((x) => x._id !== response._id),
      { ...response, correct: true },
    ];

    setShowedPost({
      ...showedPost,
      responses: newResponses.sort((a, b) => (a.timePosted > b.timePosted ? 1 : -1)),
    });
  };

  return (
    <div className="flex items-center justify-center h-full">
      <Button
        variant="contained"
        onClick={(e) => handleCorrectResponse(e, resp)}
        sx={{ height: "30px", width: "200px" }}
      >
        Correct Answer
      </Button>
    </div>
  );
};

type PostColumnProps = {
  showedPost: FullPostInfo | null;
  userDetails: UserDetails;
  setShowedPost: React.Dispatch<React.SetStateAction<FullPostInfo | null>>;
};

const PostColumn = ({ showedPost, userDetails, setShowedPost }: PostColumnProps): JSX.Element => {
  const authUser = useAuthUser();

  const [buttonLoading, setButtonLoading] = React.useState(false);
  const [postResponseText, setPostResponseText] = React.useState("");

  const handleNewResponse = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (showedPost === null) return; // Should never be null basically

    if ([postResponseText].some((x) => x.length === 0)) {
      toast.error("Please fill out all fields");
      return;
    }

    setButtonLoading(true);

    const payload: CreateNewForumReplyPayloadRequest = {
      postId: showedPost._id,
      text: postResponseText,
    };

    const [res, err] = await createNewResponse(await authUser.getIdToken(), payload, "client");
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
    // Update global state with new post
    setShowedPost({ ...showedPost, responses: [...showedPost.responses, res.responseData] });
    toast.success("Response sent successfully");
    setPostResponseText("");
  };

  if (showedPost === null) {
    return <div></div>;
  }

  return (
    <div className="flex flex-col">
      <ForumPostCard post={showedPost} />
      {showedPost.responses.map((resp, index) => (
        <div key={index} className="flex flex-row h-full w-full">
          <ForumResponseCard response={resp} />
          {!resp.correct && (
            <CorrectResponseButton
              resp={resp}
              setShowedPost={setShowedPost}
              showedPost={showedPost}
            />
          )}
        </div>
      ))}
      <form className="w-full flex flex-col" onSubmit={handleNewResponse}>
        <TextField
          id="response"
          label="Your Answer"
          sx={{ marginLeft: "40px", marginTop: "20px" }}
          value={postResponseText}
          multiline
          rows={5}
          onChange={(e) => setPostResponseText(e.target.value)}
        />
        <LoadingButton
          variant="contained"
          sx={{ width: "90px", marginLeft: "550px", marginTop: "15px" }}
          disabled={postResponseText === ""}
          type="submit"
          loading={buttonLoading}
        >
          Send
        </LoadingButton>
      </form>
    </div>
  );
};

const ForumPage = ({ courseData }: ForumPageProps): JSX.Element => {
  const user = useUser();
  const authUser = useAuthUser();
  const [loading, setLoading] = React.useState(user.userDetails === null);
  const [showedPost, setShowedPost] = useState<FullPostInfo | null>(null); // The current displayed Thread
  const [postList, setPostList] = useState([...courseData.forum.posts]);

  React.useEffect(() => {
    // Build user data for user context
    if (user.userDetails !== null) {
      setLoading(false);
    }
  }, [user.userDetails]);

  React.useEffect(() => {
    // Every time showPost gets updated, update in main postList
    if (showedPost !== null) {
      // Sort it so that it doesn't re-order
      const newList = [...postList.filter((x) => x._id !== showedPost._id), { ...showedPost }];
      setPostList([...newList.sort((a, b) => (a.timeCreated < b.timeCreated ? 1 : -1))]);
      // console.log([...newList.sort((a, b) => (a.timeCreated < b.timeCreated ? 1 : -1))]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showedPost]);

  if (loading || user.userDetails === null) return <Loading />;
  const userDetails = user.userDetails as UserDetails;

  return (
    <>
      <Head>
        <title>Forum</title>
        <meta name="description" content="Create forum test" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <AdminNavBar userDetails={userDetails} courseData={courseData} />
      <ContentContainer>
        <div className="flex flex-col w-full justify-center px-[5%]">
          <h1 className="text-3xl w-full text-left border-solid border-t-0 border-x-0 border-[#EEEEEE] pt-3">
            <span className="ml-4"></span>
          </h1>
        </div>
        <div className="flex w-full justify-left px-[2%]">
          {/* LEFT COLUMN */}
          <ThreadListColumn
            courseId={courseData._id}
            userDetails={userDetails}
            postList={postList}
            setPostList={setPostList}
            setShowedPost={setShowedPost}
          />
          {/* RIGHT COLUMN */}
          <PostColumn
            showedPost={showedPost}
            userDetails={userDetails}
            setShowedPost={setShowedPost}
          />
        </div>
      </ContentContainer>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<ForumPageProps> = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
})(async ({ AuthUser, query }): Promise<{ props: ForumPageProps } | { notFound: true }> => {
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

export default withAuthUser<ForumPageProps>({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(ForumPage);
