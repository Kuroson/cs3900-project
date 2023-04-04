import React from "react";
import { toast } from "react-toastify";
import ImageIcon from "@mui/icons-material/Image";
import { LoadingButton } from "@mui/lab";
import { Button, FormControl, Modal, TextField } from "@mui/material";
import { BasicPostInfo } from "models/post.model";
import { UserDetails } from "models/user.model";
import { useAuthUser } from "next-firebase-auth";
import { HttpException } from "util/HttpExceptions";
import { createNewPost } from "util/api/forumApi";
import { fileToDataUrl } from "util/util";

type ThreadCreationModalProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  courseId: string;
  userDetails: UserDetails;
};

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

const ThreadCreationModal = ({
  setOpen,
  open,
  courseId,
  userDetails,
}: ThreadCreationModalProps): JSX.Element => {
  const authUser = useAuthUser();

  const [postTitle, setPostTitle] = React.useState("");
  const [postDesc, setPostDesc] = React.useState("");
  const [postFile, setPostFile] = React.useState<File | null>(null);
  const [buttonLoading, setButtonLoading] = React.useState(false);

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
    let encodedImage = "";
    if (postFile !== null) {
      try {
        encodedImage = (await fileToDataUrl(postFile)) as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        toast.error(e.message);
        setPostFile(null);
        encodedImage = "";
        return;
      }
    }

    const dataPayload = {
      courseId: courseId,
      title: postTitle,
      question: postDesc,
      poster: userDetails,
      image: encodedImage,
      responses: null,
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
      courseId: courseId,
      _id: res.postId,
      image: encodedImage,
      title: postTitle,
      question: postDesc,
      poster: userDetails,
      responses: null,
    };

    // FIXME
    // postsList.push(newPost);
    toast.success("Post sent successfully");
    handleCloseForm(); // Close form and reset variables
  };

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="modal-create-thread"
      aria-describedby="modal-thread-description"
    >
      <form className="flex flex-col items-center justify-center gap-6" onSubmit={handleNewPost}>
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
              <LoadingButton
                variant="contained"
                type="submit"
                sx={{ marginTop: "30px", width: "90px", marginLeft: "320px" }}
                disabled={postTitle === "" || postDesc === ""}
                loading={buttonLoading}
              >
                Submit
              </LoadingButton>
            </div>
          </div>
        </FormControl>
      </form>
    </Modal>
  );
};

export default ThreadCreationModal;
