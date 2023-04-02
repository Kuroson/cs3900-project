/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { toast } from "react-toastify";
import Head from "next/head";
import { LoadingButton } from "@mui/lab";
import { UserCourseInformation } from "models/course.model";
import { BasicForumInfo } from "models/forum.model";
import { BasicPostInfo } from "models/post.model";
import { UserDetails } from "models/user.model";
import { GetServerSideProps } from "next";
import { AuthAction, useAuthUser, withAuthUser, withAuthUserTokenSSR } from "next-firebase-auth";
import { AdminNavBar, ContentContainer, Loading } from "components";
import { Routes } from "components/Layout/NavBars/NavBar";
import { HttpException } from "util/HttpExceptions";
import { useUser } from "util/UserContext";
import { getUserDetails } from "util/api/userApi";
import initAuth from "util/firebase";
import { createNewPost } from "util/api/forumApi";
import {
    getUserCourseDetails,
} from "util/api/courseApi";
import ForumPostCard from "components/common/ForumPostCard";
import ForumPostOverviewCard from "components/common/ForumPostOverviewCard";
import { use } from "chai";
import { useRouter } from "next/router";
import { isEmpty } from "cypress/types/lodash";
import {
    Button,
    FormControl,
    FormControlLabel,
    FormLabel,
    Modal,
    Radio,
    RadioGroup,
    TextField,
  } from "@mui/material";
initAuth(); // SSR maybe, i think...

type ForumPageProps = {
  courseData: UserCourseInformation;
};

const ForumPage = ({ courseData }: ForumPageProps): JSX.Element => {
  const user = useUser();
  const authUser = useAuthUser();
  const [loading, setLoading] = React.useState(user.userDetails === null);
  React.useEffect(() => {
    // Build user data for user context
    if (user.userDetails !== null) {
      setLoading(false);
    }
  }, [user.userDetails]);

  if (loading || user.userDetails === null) return <Loading />;
  const userDetails = user.userDetails as UserDetails;

  const postList = [
    {
        courseId: courseData._id,
        title: "What is the meaning of life?",
        question: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        _id: "id",
    },
    {
        courseId: courseData._id,
        title: "Why am I here?",
        question: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        _id: "id2",
    },
    {
        courseId: courseData._id,
        title: "Is God a woman?",
        question: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        _id: "id3",
    }]

    const [showedPost, setShowedPost] = useState<BasicPostInfo>(postList[0]);
    const [open, setOpen] = React.useState(false);
    const [postTitle, setPostTitle] = React.useState("");
    const [postDesc, setPostDesc] = React.useState("");
    const [buttonLoading, setButtonLoading] = React.useState(false);

    const date = new Date();
    const router = useRouter();
    
    function handleOnClickPostOverview(index) {
        //Clicks on a particular post overview
        setShowedPost(postList[index]);
    }

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleCloseForm = async () => {
        setOpen(false);
        setPostTitle("");
        setPostDesc("");
    };

    const handleNewPost = async (e: React.SyntheticEvent) => {
        e.preventDefault();

        if ([postTitle, postDesc].some((x) => x.length === 0)) {
          toast.error("Please fill out all fields");
          return;
        }
        //TODO image
        const title = postTitle;
        const description = postDesc;
        const courseId = courseData._id;
        const dataPayload = {
            courseId,
            title,
            description,
        };
        setButtonLoading(true);
        const [res, err] = await createNewPost(await authUser.getIdToken(), dataPayload, "client");
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
        const newPost : BasicPostInfo = {
            courseId: courseData._id,
            _id: res.postId,
            title: postTitle,
            question: postDesc,
        };

        toast.success("Course created successfully");

        //TODO add to the list of courses to global state whatever that is
        
        // user.setUserDetails({
        // ...userDetails,
        // created_courses: [...userDetails.created_courses, newCourse],
        // });
        //close form 
        setOpen(false);
        setPostTitle("");
        setPostDesc("");
    }


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
                <div className="flex flex-col rounded-lg shadow-md p-5 my-5 mx-5 w-[300px] cursor-pointer hover:shadow-lg items-center justify-center">
                    <Button variant="outlined" onClick={handleOpen} id="addNewPost">
                        New Thread
                    </Button>
                </div>
                <Modal
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description">
                    <form 
                        className="flex flex-col items-center justify-center gap-6" 
                        >
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
                            <div> 
                                <Button 
                                    variant="outlined" 
                                    color="error" 
                                    sx={{ marginTop: "30px", width: "90px" }}
                                    onClick={handleCloseForm}>
                                Cancel
                                </Button>
                                <Button 
                                    variant="contained" 
                                    onClick={handleNewPost} 
                                    sx={{ marginTop: "30px", width: "90px" }}
                                    disabled={postTitle === "" || postDesc === ""}>
                                Submit
                                </Button>
                            </div>
                        </div>
                        </FormControl>
                    </form>
                </Modal>
                {postList?.map((post, index) => (
                    <div onClick={() => handleOnClickPostOverview(index)}>
                        <ForumPostOverviewCard post={post} posterDetails={userDetails}></ForumPostOverviewCard>
                    </div>          
                ))}  
            </div>
            <ForumPostCard post={showedPost} posterDetails={userDetails} datePosted={date.toLocaleString()}></ForumPostCard>;
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
  