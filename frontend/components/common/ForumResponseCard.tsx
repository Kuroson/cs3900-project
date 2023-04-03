import React from "react";
import Link from "next/link";
import { Avatar } from "@mui/material";
import { BasicResponseInfo } from "models/response.model";
import { useUser } from "util/UserContext";
import UserDetailsSection from "../Layout/NavBars/UserDetailSection";
import { UserDetails } from "models/user.model";
import DoneIcon from '@mui/icons-material/Done';

type ForumResponseCardProps = {
  response: BasicResponseInfo,
};

const ForumResponseCard: React.FC<ForumResponseCardProps> = ({ response }): JSX.Element => {  
    if (response === null) return <></>
    else
    return (
    <div className="flex flex-col p-2 pl-10 w-[600px]">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="mt-5 flex flex-row justify-center">
                    <div className="w-[40px] h-[40px] bg-orange-500 rounded-full flex justify-center items-center">
                        <span className="text-l font-bold">
                            {(response.poster.first_name?.charAt(0) ?? "") + (response.poster.last_name?.charAt(0) ?? "")}
                        </span>
                    </div>
                    <div className="flex flex-col justify-center items-center">
                        <span className="text-start pl-3">{`${response.poster.first_name} ${response.poster.last_name}`}</span>
                        <span>{`1 hour ago`}</span>
                        <div className="text-l font-bold pt-3">
                            { response.correct === true && 
                                <DoneIcon style={{ fill: '#00A400' }} />
                            }
                            <span className="pl-2">{response.response}</span> 
                        </div>
                    </div>
                </div>    
            </div>
        </div>
    </div>
  );
};

export default ForumResponseCard;
