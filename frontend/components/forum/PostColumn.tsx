/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { toast } from "react-toastify";
import { LoadingButton } from "@mui/lab";
import { TextField } from "@mui/material";
import { FullPostInfo } from "models/post.model";
import { UserDetails } from "models/user.model";
import { useAuthUser } from "next-firebase-auth";
import { CorrectResponseButton } from "components";
import ForumPostCard from "components/common/ForumPostCard";
import ForumResponseCard from "components/common/ForumResponseCard";
import { HttpException } from "util/HttpExceptions";
import { CreateNewForumReplyPayloadRequest, createNewResponse } from "util/api/forumApi";

type PostColumnProps = {
  showedPost: FullPostInfo | null;
  userDetails: UserDetails;
  courseId: string;
  setShowedPost: React.Dispatch<React.SetStateAction<FullPostInfo | null>>;
  admin?: true;
};

const PostColumn = ({
  showedPost,
  userDetails,
  courseId,
  setShowedPost,
  admin,
}: PostColumnProps): JSX.Element => {
  const authUser = useAuthUser();

  const [buttonLoading, setButtonLoading] = React.useState(false);
  const [postResponseText, setPostResponseText] = React.useState("");

  React.useEffect(() => {
    setPostResponseText("");
  }, [showedPost]);

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
      courseId: courseId,
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
        <div key={index} className="flex flex-row w-full">
          <ForumResponseCard response={resp} />
          {!resp.correct && admin && (
            <CorrectResponseButton
              resp={resp}
              setShowedPost={setShowedPost}
              showedPost={showedPost}
              courseId={courseId}
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

export default PostColumn;
