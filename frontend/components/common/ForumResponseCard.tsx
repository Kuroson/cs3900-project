import React from "react";
import Link from "next/link";
import DoneIcon from "@mui/icons-material/Done";
import { Avatar } from "@mui/material";
import { BasicResponseInfo } from "models/response.model";
import { UserDetails } from "models/user.model";
import { useUser } from "util/UserContext";
import UserDetailsSection from "../Layout/NavBars/UserDetailSection";

type ForumResponseCardProps = {
  response: BasicResponseInfo;
};

const ForumResponseCard: React.FC<ForumResponseCardProps> = ({ response }): JSX.Element => {
  if (response === null) return <></>;
  else {
    console.log(response);
    var timeDiff = (Date.now() / 1000 - response.timePosted).toFixed(0);
    var timeUnit = "";
    if (parseInt(timeDiff) < 60) {
        //seconds
        timeUnit = "sec ago";
    } else if (parseInt(timeDiff) >= 60 && parseInt(timeDiff) < 3600) {
        timeDiff = (parseInt(timeDiff) / 60).toFixed(0);
        timeUnit = "min ago";
    } else if (parseInt(timeDiff) >= 3600 && parseInt(timeDiff) < 3600*24) {
        timeDiff = (parseInt(timeDiff) / 3600).toFixed(0);
        timeUnit = "hours ago";
    } else {
        timeDiff = (parseInt(timeDiff) / (3600*24)).toFixed(0);
        timeUnit = "days ago";
    }
    return (
      <div className="flex flex-col p-2 pl-10 w-[600px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="mt-5 flex flex-row justify-center">
              <div className="w-[40px] h-[40px] bg-orange-500 rounded-full flex justify-center items-center">
                <span className="text-l font-bold">
                  {(response.poster.first_name?.charAt(0) ?? "") +
                    (response.poster.last_name?.charAt(0) ?? "")}
                </span>
              </div>
              <div className="flex flex-col justify-center items-center">
                <span className="text-start pl-3">{`${response.poster.first_name} ${response.poster.last_name}`}</span>
                <span>{timeDiff} {timeUnit}</span>
                <div className="text-l font-bold pt-3">
                  {response.correct === true && <DoneIcon style={{ fill: "#00A400" }} />}
                  <span className="pl-2">{response.response}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default ForumResponseCard;
