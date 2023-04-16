import { Avatar } from "@mui/material";
import { deepOrange } from "@mui/material/colors";

type CourseDetailsProps = {
  code: string;
  avatar: string;
};

const CourseDetails = ({ code, avatar }: CourseDetailsProps): JSX.Element => {
  return (
    <div className="mt-5 ml-2 flex items-center w-max-[130px] overflow-hidden">
      <Avatar sx={{ bgcolor: deepOrange[500], width: "50px", height: "50px" }} src={avatar}>
        {code.charAt(0)}
      </Avatar>
      <div className="flex flex-col pl-2 justify-center items-center">
        <span className="font-bold text-start w-full text-2xl">{code}</span>
      </div>
    </div>
  );
};

export default CourseDetails;
