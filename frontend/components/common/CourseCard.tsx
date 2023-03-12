import React from "react";
import { Avatar, Card, CardContent, Typography } from "@mui/material";
import { Course } from "pages/admin";

const CourseCard: React.FC<{ course: Course }> = ({ course }) => {
  console.log(course);
  return (
    <div className="flex flex-col rounded-lg shadow-md p-5 my-2 mx-5 w-[400px] h-[264px] cursor-pointer hover:shadow-lg">
      <div className="flex items-center gap-2">
        <Avatar alt="Course" src={course.icon || "Course"} />
        <h3>{course.courseId}</h3>
      </div>
      <h4 className="my-0">{course.title}</h4>
      <p className="h-[150px] overflow-hidden">{course.description}</p>
    </div>
  );
};

export default CourseCard;
