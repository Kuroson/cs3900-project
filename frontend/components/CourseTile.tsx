import Link from "next/link";
import { Button } from "@mui/material";
import { getAuth, signOut } from "firebase/auth";

type CourseTileProps = {
  courseCode?: string;
  courseName?: string;
  courseDescription?: string | null;
  courseIconURL?: string | null;
};

const CourseTileDetails = ({ courseCode, courseName, courseDescription, courseIconURL }: CourseTileProps): JSX.Element => {
  return (
    <div className="mt-5 ml-5 flex flex-row">
      <div className="w-[25px] h-[25px] bg-orange-500 rounded-full flex justify-center items-center">
        <span className="text-2xl font-bold">!</span>
      </div>
      <div className="flex flex-col pl-2 justify-center items-center">
        <span className="font-bold text-start w-full">{`${courseCode}`}</span>
        <span className="text-start w-full">{courseName}</span>
        <span className="text-start w-full">{courseDescription}</span>        
      </div>
    </div>
  );
};

export default function CourseTile({
  courseCode,
  courseName,
  courseDescription,
  courseIconURL,
}: CourseTileProps): JSX.Element {
  return (
    <div className="">
      {/* Top */}
      <CourseTileDetails
        courseName={courseName}
        courseCode={courseCode}
        courseDescription={courseDescription}
        courseIconURL={courseIconURL}
      />
    </div>
  );
}
