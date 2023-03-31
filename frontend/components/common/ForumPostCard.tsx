import React from "react";
import Link from "next/link";
import { Avatar } from "@mui/material";
import { BasicPostInfo } from "models/post.model";
import { useUser } from "util/UserContext";
import UserDetailsSection from "../Layout/NavBars/UserDetailSection";
import { UserDetails } from "models/user.model";

type ForumPostCardProps = {
  post: BasicPostInfo,
  posterDetails: UserDetails,
  datePosted: string
};

const ForumPostCard: React.FC<ForumPostCardProps> = ({ post, posterDetails, datePosted }): JSX.Element => {
  return (
    <div className="flex flex-col rounded-lg shadow-md p-5 my-2 mx-5 w-[600px] cursor-pointer hover:shadow-lg">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="mt-5 flex flex-row justify-center">
                    <div className="w-[40px] h-[40px] bg-orange-500 rounded-full flex justify-center items-center">
                        <span className="text-l font-bold">
                        XX
                        </span>
                    </div>
                    <div className="flex flex-col pl-2 justify-center items-center">
                        <span className="font-bold text-start w-full">{`${posterDetails.first_name} ${posterDetails.last_name}`}</span>
                        <span>{datePosted}</span>
                    </div>
                </div>    
            </div>
        </div>
        <div className="text-xl font-bold pt-2">{post.title}</div>
        <p className="h-[150px] overflow-hidden pt-2">{post.question}</p>
    </div>
  );
};

export default ForumPostCard;
