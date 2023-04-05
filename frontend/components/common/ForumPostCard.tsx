import React from "react";
import { Divider } from "@mui/material";
import { FullPostInfo } from "models/post.model";
import moment from "moment";

type ForumPostCardProps = {
  post: FullPostInfo;
};

const ForumPostCard: React.FC<ForumPostCardProps> = ({ post }): JSX.Element => {
  console.log(post);
  return (
    <>
      <div className="flex flex-col rounded-lg px-5 pb-5 mb-2 mx-5 w-[600px]">
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
                <span className="w-full text-start">
                  {moment.unix(post.timeCreated).format("DD/MM/YY hh:mm A")}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="text-xl font-bold pt-6 pb-3">{post.title}</div>
        <p className="mh-[150px] overflow-hidden pt-2">{post.question}</p>
        {post.image !== undefined && post.image.length !== 0 && (
          <img src={post.image} alt="post image here" />
        )}
      </div>
      <div className="ml-8 pb-2">
        <Divider />
      </div>
    </>
  );
};

export default ForumPostCard;
