import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
} from "@mui/material";
import dayjs from "dayjs";
import { AssignmentInfoType } from "models/assignment.model";
import { QuizBasicInfo, QuizInfoType } from "models/quiz.model";
import { useAuthUser } from "next-firebase-auth";
import PageHeader from "components/common/PageHeader";
import { HttpException } from "util/HttpExceptions";
import { getAssignmentInfo } from "util/api/assignmentApi";
import { updateQuizAdmin } from "util/api/quizApi";
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

  // edit quiz info
  const handleEditInfo = async (newInfo: QuizBasicInfo) => {
    const [res, err] = await updateQuizAdmin(
      await authUser.getIdToken(),
      { ...newInfo, quizId: quizId },
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
    toast.success("Edited quiz successfully");

    setQuizInfo((prev) => ({
      questions: prev?.questions ?? [],
      title: newInfo.title,
      open: newInfo.open,
      close: newInfo.close,
      description: newInfo.description,
      maxMarks: newInfo.maxMarks,
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
          isAdmin={true}
          handleEditInfo={handleEditInfo}
        />
        {/* TODO: Add grading assignments */}
      </div>
    </>
  );
};

export default AdminAssignment;
