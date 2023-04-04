import React from "react";
import { FullPostInfo } from "models/post.model";

type ForumPostOverviewCardProps = {
  post: FullPostInfo;
};

const ForumPostOverviewCard: React.FC<ForumPostOverviewCardProps> = ({ post }): JSX.Element => {
  return (
    <div className="flex flex-col rounded-lg shadow-md p-2 my-2 mx-5 w-[300px] cursor-pointer hover:shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="mt-5 flex flex-row justify-center">
            <div className="w-[40px] h-[40px] bg-orange-500 rounded-full flex justify-center items-center">
              <span className="text-l font-bold">
                {(post.poster.first_name?.charAt(0) ?? "") +
                  (post.poster.last_name?.charAt(0) ?? "")}
              </span>
            </div>
            <div className="flex flex-col pl-2 justify-center items-center">
              <span className="text-start w-full">{`${post.poster.first_name} ${post.poster.last_name}`}</span>
              <div className="text-l font-bold pt-0.5">{post.title}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumPostOverviewCard;
