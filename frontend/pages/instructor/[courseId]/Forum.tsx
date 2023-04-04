/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { toast } from "react-toastify";
import Head from "next/head";
import { useRouter } from "next/router";
import { Button, FormControl, Modal, TextField } from "@mui/material";
import { UserCourseInformation } from "models/course.model";
import { BasicPostInfo, FullPostInfo } from "models/post.model";
import { BasicResponseInfo } from "models/response.model";
import { UserDetails } from "models/user.model";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { AdminNavBar, ContentContainer, Loading, ThreadCreationModal } from "components";
import ForumPostCard from "components/common/ForumPostCard";
import ForumPostOverviewCard from "components/common/ForumPostOverviewCard";
import ForumResponseCard from "components/common/ForumResponseCard";
import { HttpException } from "util/HttpExceptions";
import { useUser } from "util/UserContext";
import { getUserCourseDetails } from "util/api/courseApi";
import { createNewPost, createNewResponse, markCorrectResponse } from "util/api/forumApi";
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
};

const ThreadListColumn = ({
  courseId,
  userDetails,
  postList,
  setPostList,
}: ThreadListColumnProps): JSX.Element => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  function handleOnClickPostOverview(post: BasicPostInfo) {
    //Clicks on a particular post overview
    // if (showedPost !== null) {
    //   setPostList([...postList.filter((x) => x._id !== showedPost._id), showedPost]);
    // }
    // FIXME
    // setShowedPost(postList?.filter((x) => x._id === post._id).pop());
  }

  return (
    <div className="outline">
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
      />
      {postList.map((post, index) => (
        <div key={index} onClick={() => handleOnClickPostOverview(post)}>
          <ForumPostOverviewCard post={post} />
        </div>
      ))}
    </div>
  );
};

const ForumPage = ({ courseData }: ForumPageProps): JSX.Element => {
  const user = useUser();
  const authUser = useAuthUser();
  const [loading, setLoading] = React.useState(user.userDetails === null);
  const [showedPost, setShowedPost] = useState<BasicPostInfo | null>(null);
  const [postList, setPostList] = useState(courseData.forum.posts);

  const [buttonLoading, setButtonLoading] = React.useState(false);

  const [postResponseText, setPostResponseText] = React.useState("");

  React.useEffect(() => {
    // Build user data for user context
    if (user.userDetails !== null) {
      setLoading(false);
    }
  }, [user.userDetails]);

  if (loading || user.userDetails === null) return <Loading />;
  const userDetails = user.userDetails as UserDetails;

  const date = new Date();

  const handleNewResponse = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if ([postResponseText].some((x) => x.length === 0)) {
      toast.error("Please fill out all fields");
      return;
    }

    if (showedPost === null) {
      return;
    }

    const postId = showedPost._id;
    const text = postResponseText;
    const timePosted = Date.now() / 1000;
    const dataPayload = {
      postId,
      text,
      timePosted,
    };
    setButtonLoading(true);
    const [res, err] = await createNewResponse(await authUser.getIdToken(), dataPayload, "client");
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
    const newResponse: BasicResponseInfo = {
      _id: res.responseId,
      response: postResponseText,
      correct: true,
      poster: userDetails,
      timePosted: Date.now() / 1000,
    };
    if (showedPost.responses === null) {
      showedPost.responses = [];
    }
    showedPost.responses.push(newResponse);

    toast.success("Response sent successfully");

    // //close form
    // setOpen(false);
    // setPostTitle("");
    // setPostDesc("");
    // setPostResponseText("");
  };

  const handleCorrectResponse = async (e: React.SyntheticEvent, response: BasicResponseInfo) => {
    e.preventDefault();
    const responseId = response._id;
    const [res, err] = await markCorrectResponse(await authUser.getIdToken(), responseId, "client");
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
    if (res === null) throw new Error("Didn't save the correct state correctly"); // Actual error that should never happen
    setButtonLoading(false);

    // Update global state with new response state
    if (showedPost !== null && showedPost.responses !== null) {
      const newResponse = {
        _id: response._id,
        correct: true,
        poster: response.poster,
        timePosted: response.timePosted,
        response: response.response,
      };
      setShowedPost({
        ...showedPost,
        responses: [...showedPost.responses.filter((x) => x._id !== response._id), newResponse],
      });
      setPostList([...postList.filter((x) => x._id !== showedPost._id), showedPost]);
    }
  };
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
          {/* HERE */}
          <ThreadListColumn
            courseId={courseData._id}
            userDetails={userDetails}
            postList={postList}
            setPostList={setPostList}
          />
          {/* <div className="flex flex-col">
            <ForumPostCard post={showedPost} datePosted={date.toLocaleString()}></ForumPostCard>
            {showedPost?.responses?.map((resp, index) => (
              <div key={index} className="flex flex-row">
                <ForumResponseCard response={resp} />
                {resp.correct === false && (
                  <Button
                    variant="contained"
                    onClick={(e) => handleCorrectResponse(e, resp)}
                    sx={{ height: "30px", width: "200px" }}
                  >
                    Correct Answer
                  </Button>
                )}
              </div>
            ))}
            {showedPost !== null && (
              <>
                <TextField
                  id="response"
                  label="Your Answer"
                  sx={{ marginLeft: "40px", marginTop: "20px" }}
                  value={postResponseText}
                  multiline
                  rows={5}
                  onChange={(e) => setPostResponseText(e.target.value)}
                />
                <Button
                  variant="contained"
                  onClick={handleNewResponse}
                  sx={{ width: "90px", marginLeft: "550px", marginTop: "15px" }}
                  disabled={postResponseText === ""}
                >
                  Send
                </Button>
              </>
            )}
          </div> */}
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
