import React from "react";
import Link from "next/link";
import { Avatar } from "@mui/material";
import { BasicCourseInfo } from "models/course.model";

type CourseCardProps = {
  course: BasicCourseInfo;
  href: string;
};

const CourseCard: React.FC<CourseCardProps> = ({ course, href }): JSX.Element => {
  return (
    <Link
      href={href}
      className="flex flex-col rounded-lg shadow-md p-5 my-2 mx-5 w-[370px] h-[264px] cursor-pointer hover:shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar alt="Course" src={course.icon ?? "Course"} />
          <h3>{course.code}</h3>
        </div>
        <span className="bg-[#b0e3de] p-1 rounded-md font-bold text-white">{course.session}</span>
      </div>
      <h4 className="my-1.5">{course.title}</h4>
      <p className="h-[150px] overflow-hidden">{course.description}</p>
    </Link>
  );
};

export default CourseCard;
