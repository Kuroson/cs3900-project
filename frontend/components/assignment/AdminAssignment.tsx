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

const AdminAssignment: React.FC<{
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

  const canEditAssignment = () => {
    // Can only edit quiz before opening
    const isClosed = new Date() > new Date(Date.parse(assignmentInfo.deadline));

    if (isClosed) {
      toast.error("Can only edit assignment before deadline");
    }
    return !isClosed;
  };

  // edit assignment info
  const handleEditInfo = async (newInfo: AssignmentInfoType) => {
    if (!canEditAssignment()) return;

    const [res, err] = await updateAssignmentAdmin(
      await authUser.getIdToken(),
      { ...newInfo, courseId, assignmentId },
      "client",
    );
    if (err !== null) {
      console.error(err);
      if (err instanceof HttpException) {
        toast.error(err.message);
      } else {
        toast.error("Failed to edit quiz");
      }
      return;
    }
    if (res === null) throw new Error("Shouldn't happen");
    toast.success("Edited assignment successfully");

    setAssignmentInfo((prev) => ({
      title: newInfo.title,
      description: newInfo.description,
      deadline: newInfo.deadline,
      marksAvailable: newInfo.marksAvailable,
      tags: newInfo.tags,
    }));
  };

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
          isAdmin={true}
          handleEditInfo={handleEditInfo}
        />
        {/* TODO: Add grading assignments */}
      </div>
    </>
  );
};

export default AdminAssignment;
