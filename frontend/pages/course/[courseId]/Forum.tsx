/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { toast } from "react-toastify";
import Head from "next/head";
import { useRouter } from "next/router";
import ImageIcon from "@mui/icons-material/Image";
import { Button, FormControl, Modal, TextField } from "@mui/material";
import { UserCourseInformation } from "models/course.model";
import { BasicPostInfo } from "models/post.model";
import { BasicResponseInfo } from "models/response.model";
import { UserDetails } from "models/user.model";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { AdminNavBar, ContentContainer, Loading } from "components";
import ForumPostCard from "components/common/ForumPostCard";
import ForumPostOverviewCard from "components/common/ForumPostOverviewCard";
import ForumResponseCard from "components/common/ForumResponseCard";
import { HttpException } from "util/HttpExceptions";
import { useUser } from "util/UserContext";
import { getUserCourseDetails } from "util/api/courseApi";
import { createNewPost, createNewResponse, getCourseForum } from "util/api/forumApi";
import initAuth from "util/firebase";
import { fileToDataUrl } from "util/util";
import dayjs from "dayjs";

initAuth(); // SSR maybe, i think...

type ForumPageProps = {
  courseData: UserCourseInformation;
};

const ForumPage = ({ courseData }: ForumPageProps): JSX.Element => {
  const user = useUser();
  const authUser = useAuthUser();
  const [loading, setLoading] = React.useState(user.userDetails === null);
  const [showedPost, setShowedPost] = useState<BasicPostInfo | null>(null);
  const [postsList, setPostsList] = useState<Array<BasicPostInfo>>(courseData.forum.posts);
  const [open, setOpen] = React.useState(false);
  const [postTitle, setPostTitle] = React.useState("");
  const [postDesc, setPostDesc] = React.useState("");
  const [postFile, setPostFile] = React.useState<File | null>(null);
  const [buttonLoading, setButtonLoading] = React.useState(false);
  const [postResponseText, setPostResponseText] = React.useState("");

  const date = new Date();
  const router = useRouter();

  React.useEffect(() => {
    // Build user data for user context
    if (user.userDetails !== null) {
      setLoading(false);
    }
  }, [user.userDetails]);

  if (loading || user.userDetails === null) return <Loading />;
  const userDetails = user.userDetails as UserDetails;

  function handleOnClickPostOverview(index: number) {
    //Clicks on a particular post overview
    setShowedPost(postsList[index]);
  }

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleCloseForm = async () => {
    setOpen(false);
    setPostTitle("");
    setPostDesc("");
    setPostFile(null);
  };

  const handleNewPost = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    if ([postTitle, postDesc].some((x) => x.length === 0)) {
      toast.error("Please fill out all fields");
      return;
    }

    // Handle image
    let encoded_image = "";
    if (postFile !== null) {
      try {
        encoded_image = (await fileToDataUrl(postFile)) as string;
      } catch (e: any) {
        toast.error(e.message);
        setPostFile(null);
        encoded_image = "";
        return;
      }
    }

    const title = postTitle;
    const question = postDesc;
    const courseId = courseData._id;
    const poster = userDetails;
    const image = encoded_image;
    const responses = null;
    const dataPayload = {
      courseId,
      title,
      question,
      poster,
      image,
      responses,
    };
    setButtonLoading(true);
    const [res, err] = await createNewPost(await authUser.getIdToken(), dataPayload, "client");
    console.log(res);
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
    console.log(res);
    setButtonLoading(false);

    // Update global state with new post
    const newPost: BasicPostInfo = {
      courseId: courseData._id,
      _id: res.postId,
      image: encoded_image,
      title: postTitle,
      question: postDesc,
      poster: userDetails,
      responses: null,
    };

    postsList.push(newPost);

    toast.success("Post sent successfully");

    //close form
    setOpen(false);
    setPostTitle("");
    setPostDesc("");
    setPostFile(null);
    encoded_image = "";

  };

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
      timePosted
    };
    setButtonLoading(true);
    const [res, err] = await createNewResponse(await authUser.getIdToken(), dataPayload, "client");
    console.log(res);
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
      correct: false,
      poster: userDetails,
      timePosted: Date.now() / 1000
    };
    if (showedPost.responses === null) {
      showedPost.responses = [];
    }
    showedPost.responses.push(newResponse);

    toast.success("Response sent successfully");

    //close form
    setOpen(false);
    setPostTitle("");
    setPostDesc("");
    setPostResponseText("");
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
            <span className="ml-4">Class Forum</span>
          </h1>
        </div>

        <div className="flex inline-block w-full justify-left px-[2%]">
          <div>
            <div className="flex flex-col rounded-lg shadow-md p-2 my-5 mx-5 w-[300px] cursor-pointer hover:shadow-lg items-center justify-center">
              <Button variant="text" onClick={handleOpen} id="addNewPost">
                New Thread
              </Button>
            </div>
            <Modal
              open={open}
              onClose={handleClose}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <form className="flex flex-col items-center justify-center gap-6">
                <FormControl sx={style}>
                  <div className="flex flex-col gap-10">
                    <TextField
                      id="title"
                      label="Title"
                      value={postTitle}
                      sx={{ width: "500px" }}
                      onChange={(e) => setPostTitle(e.target.value)}
                    />
                    <TextField
                      id="description"
                      label="Description"
                      sx={{ width: "500px", marginTop: "30px" }}
                      value={postDesc}
                      multiline
                      rows={9}
                      onChange={(e) => setPostDesc(e.target.value)}
                    />
                    <div className="flex items-center">
                      <Button
                        variant="outlined"
                        component="label"
                        sx={{ width: "170px", marginTop: "30px" }}
                        startIcon={<ImageIcon />}
                        id="uploadAssignmentMaterial"
                      >
                        Upload image
                        <input
                          id="uploadFileInput"
                          hidden
                          type="file"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            if (e.target.files && e.target.files.length > 0) {
                              setPostFile(e.target.files[0]);
                            }
                          }}
                        />
                      </Button>
                      {postFile !== null && (
                        <p className="pl-5">
                          <i>{postFile.name}</i>
                        </p>
                      )}
                    </div>
                    <div>
                      <Button
                        variant="outlined"
                        color="error"
                        sx={{ marginTop: "30px", width: "90px" }}
                        onClick={handleCloseForm}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleNewPost}
                        sx={{ marginTop: "30px", width: "90px", marginLeft: "320px" }}
                        disabled={postTitle === "" || postDesc === ""}
                      >
                        Submit
                      </Button>
                    </div>
                  </div>
                </FormControl>
              </form>
            </Modal>
            {postsList?.map((post, index) => (
              <div key={index} onClick={() => handleOnClickPostOverview(index)}>
                <ForumPostOverviewCard post={post} />
              </div>
            ))}
          </div>
          <div className="flex flex-col">
            <ForumPostCard post={showedPost} datePosted={date.toLocaleString()}></ForumPostCard>
            {showedPost?.responses?.map((response, index) => (
              <ForumResponseCard key={index} response={response} />
            ))}
            {showedPost !== null && (
              <TextField
                id="response"
                label="Your Answer"
                sx={{ marginLeft: "40px", marginTop: "20px" }}
                value={postResponseText}
                multiline
                rows={5}
                onChange={(e) => setPostResponseText(e.target.value)}
              />
            )}
            {showedPost !== null && (
              <Button
                variant="contained"
                onClick={handleNewResponse}
                sx={{ width: "90px", marginLeft: "550px", marginTop: "15px" }}
                disabled={postResponseText === ""}
              >
                Send
              </Button>
            )}
          </div>
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

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  width: "570px",
};
