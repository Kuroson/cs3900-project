import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@mui/material";
import dayjs from "dayjs";
import { AssignmentInfoType } from "models/assignment.model";
import { useAuthUser } from "next-firebase-auth";
import PageHeader from "components/common/PageHeader";
import { HttpException } from "util/HttpExceptions";
import { getAssignmentInfo, updateAssignmentAdmin } from "util/api/assignmentApi";
import AssignmentInfoCard from "./AssignmentInfoCard";

const StudentAssignment: React.FC<{
  assignmentId: string;
  handleClose: () => void;
  courseId: string;
  courseTags: Array<string>;
}> = ({ assignmentId, handleClose, courseId, courseTags }): JSX.Element => {
  const authUser = useAuthUser();
  const [assignmentInfo, setAssignmentInfo] = useState<AssignmentInfoType>({
    title: "",
    deadline: "",
    marksAvailable: 0,
    tags: [],
  });

  useEffect(() => {
    const getAssignment = async () => {
      const [res, err] = await getAssignmentInfo(
        await authUser.getIdToken(),
        courseId,
        assignmentId,
        "client",
      );
      if (err !== null) {
        console.error(err);
      }

      if (res === null) throw new Error("Response and error are null");
      setAssignmentInfo(res);
    };
    getAssignment();
  }, [authUser, assignmentId]);

  return (
    <>
      <PageHeader title={assignmentInfo?.title ?? ""}>
        <Button variant="outlined" onClick={handleClose}>
          Back
        </Button>
      </PageHeader>
      <div className="mt-7 mx-auto flex flex-col gap-9 w-full max-w-[800px]">
        <AssignmentInfoCard
          info={{
            title: assignmentInfo.title,
            description: assignmentInfo.description,
            marksAvailable: assignmentInfo.marksAvailable,
            deadline: assignmentInfo.deadline,
            tags: assignmentInfo.tags,
          }}
          courseTags={courseTags}
          isAdmin={false}
        />
        {/* TODO: Add viewing/submitting assignment */}
      </div>
    </>
  );
};

export default StudentAssignment;
