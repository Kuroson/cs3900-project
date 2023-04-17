import YouTube from "react-youtube";
import moment from "moment";
import { youtubeURLParser } from "util/util";
import { OnlineClassFull } from "models/onlineClass.model";

type OnlineClassVideoSectionProps = {
  dynamicOnlineClass: OnlineClassFull;
};

const OnlineClassVideoSection = ({
  dynamicOnlineClass,
}: OnlineClassVideoSectionProps): JSX.Element => {
  const opts = {
    height: "400px",
    width: "100%",
  };

  const videoId = youtubeURLParser(dynamicOnlineClass.linkToClass);

  return (
    <div className="flex flex-col w-full h-full">
      <h1 className="text-5xl text-center">{dynamicOnlineClass.title}</h1>
      <p className="w-full text-center text-xl pt-3">{dynamicOnlineClass.description}</p>
      <p className="w-full text-center text-xl pt-3">
        {moment.unix(dynamicOnlineClass.startTime).format("DD/MM/YYYY hh:mm A")}
      </p>
      <div className="w-full h-[400px] pt-3">
        <YouTube videoId={videoId !== false ? videoId : ""} opts={opts} />
      </div>
    </div>
  );
};

export default OnlineClassVideoSection;
