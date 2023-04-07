import React from "react";
import YouTube from "react-youtube";
import Link from "next/link";
import { Avatar } from "@mui/material";
import { OnlineClassUserInformation } from "models/onlineClass.model";
import moment from "moment";
import { youtubeURLParser } from "util/util";

type OnlineClassCardProps = {
  onlineClass: OnlineClassUserInformation;
  href?: string;
};

type OptionalLinkProps = {
  href?: string;
  children: React.ReactNode;
};

const OptionalLink = ({ href, children }: OptionalLinkProps): JSX.Element => {
  if (href !== undefined) {
    return (
      <Link href={href} className="cursor-pointer hover:scale-[1.01]">
        {children}
      </Link>
    );
  }
  return <>{children}</>;
};

const OnlineClassCard: React.FC<OnlineClassCardProps> = ({ onlineClass, href }): JSX.Element => {
  const LiveSpan = (): JSX.Element => {
    if (onlineClass.running) {
      return <span className="bg-[#b0e3de] p-1 rounded-md font-bold text-red-500">{"LIVE"}</span>;
    }
    return <></>;
  };

  const opts = {
    height: "100%",
    width: "100%",
  };

  const videoId = youtubeURLParser(onlineClass.linkToClass);

  return (
    <OptionalLink href={href}>
      <div className="flex flex-col rounded-lg w-[370px] h-[264px] shadow-md p-5 my-2 mx-5">
        <div className="w-full flex flex-row justify-between items-center">
          <h1 className="my-1.5 text-xl">{onlineClass.title}</h1>
          <div>
            <LiveSpan />
          </div>
        </div>
        <YouTube videoId={videoId !== false ? videoId : ""} opts={opts} />
        <div className="flex py-2 w-full items-center justify-center">
          <span className="bg-[#b0e3de] p-1 rounded-md font-bold text-blue-500">
            {moment.unix(onlineClass.startTime).format("DD/MM/YYYY hh:mm A")}
          </span>
        </div>
        {/* <p className="h-[150px] truncate pt-52">{onlineClass.description ?? ""}</p> */}
      </div>
    </OptionalLink>
  );
};

export default OnlineClassCard;
