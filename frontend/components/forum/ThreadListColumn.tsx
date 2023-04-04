import React from "react";
import { Button } from "@mui/material";
import { FullPostInfo } from "models/post.model";
import { UserDetails } from "models/user.model";
import ForumPostOverviewCard from "./ForumPostOverviewCard";
import ThreadCreationModal from "./ThreadCreationModal";

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

export default ThreadListColumn;
