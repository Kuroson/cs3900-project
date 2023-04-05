import React from "react";
import { FullPostInfo } from "models/post.model";

type ForumPostOverviewCardProps = {
  post: FullPostInfo;
};

const ForumPostOverviewCard: React.FC<ForumPostOverviewCardProps> = ({ post }): JSX.Element => {
  return (
    <div className="flex flex-col rounded-md my-1 mx-5 w-[300px] cursor-pointer hover:shadow-md">
      <div className="flex items-center justify-between px-3 py-5">
        <div className="w-[40px] h-[40px] bg-orange-500 rounded-full flex justify-center items-center">
          <span className="text-lg font-bold">
            {(post.poster.first_name?.charAt(0) ?? "") + (post.poster.last_name?.charAt(0) ?? "")}
          </span>
        </div>
        <div className="flex flex-col pl-2 justify-center items-center">
          <span className="text-start w-full">{`${post.poster.first_name} ${post.poster.last_name}`}</span>
          <div className="text-l font-bold pt-0.5 w-[225px] text-left truncate">{post.title}</div>
        </div>
      </div>
    </div>
  );
};

export default ForumPostOverviewCard;
