import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import CommentIcon from "@mui/icons-material/Comment";
import DriveFolderUploadIcon from "@mui/icons-material/DriveFolderUpload";
import SendIcon from "@mui/icons-material/Send";
import SpellcheckIcon from "@mui/icons-material/Spellcheck";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import { Button, TextField } from "@mui/material";
import dayjs from "dayjs";
import { AssignmentInfoType } from "models/assignment.model";
import { useAuthUser } from "next-firebase-auth";
import PageHeader from "components/common/PageHeader";
import Tag from "components/common/Tag";
import TitleWithIcon from "components/common/TitleWithIcon";
import { HttpException } from "util/HttpExceptions";
import { getAssignmentInfo, submitAssignment, updateAssignmentAdmin } from "util/api/assignmentApi";
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

  // Submit assignment
  const [submitted, setSubmitted] = React.useState<boolean>(false);
  const [title, setTitle] = React.useState<string>("");
  const [file, setFile] = React.useState<File | null>(null);

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
      setSubmitted(res.submission !== undefined);
    };
    getAssignment();
  }, [authUser, courseId, assignmentId]);

  const handleSubmitAssignment = async () => {
    if (file === null) return;
    const timeSubmitted = String(Date.now() / 1000);
    const [res, err] = await submitAssignment(
      await authUser.getIdToken(),
      file,
      { courseId, assignmentId, title, timeSubmitted },
      "client",
    );

    if (err !== null) {
      console.error(err);
      if (err instanceof HttpException) {
        toast.error(err.message);
      } else {
        toast.error("Failed to upload file");
      }
      return;
    }

    if (res === null) {
      toast.error("Shouldn't happen");
      return;
    }
    assignmentInfo.submission = {
      title,
      linkToSubmission: res.linkToSubmission,
    };
    toast.success("File uploaded");

    setFile(null);
    setTitle("");
    setSubmitted(true);
  };

  const afterDeadline = () => {
    return new Date() > new Date(Date.parse(assignmentInfo.deadline));
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
            markAwarded: assignmentInfo.submission?.mark,
          }}
          courseTags={courseTags}
          isAdmin={false}
        />
        {/* Viewing/submitting assignment */}
        <div>
          {submitted && (
            <div className="flex flex-col gap-4">
              <TitleWithIcon text="Assignment Result">
                <SpellcheckIcon color="primary" />
              </TitleWithIcon>
              {/* Submission */}
              <div>
                <span className="w-full text-xl font-medium mr-3">
                  {assignmentInfo.submission?.title}
                </span>
                {assignmentInfo.submission?.linkToSubmission !== undefined && (
                  <Link href={assignmentInfo.submission?.linkToSubmission} target="_blank">
                    <Button variant="outlined">Download File</Button>
                  </Link>
                )}
              </div>
              <TitleWithIcon text="Success Tags">
                <ThumbUpIcon color="primary" />
              </TitleWithIcon>
              <div className="flex gap-2">
                {assignmentInfo.submission?.successTags?.map((tag, idx) => (
                  <Tag text={tag} key={`good_tag_${idx}`} color="bg-[#4caf50]" />
                ))}
              </div>
              <TitleWithIcon text="Improvement Tags">
                <ThumbDownIcon color="primary" />
              </TitleWithIcon>
              <div className="flex gap-2">
                {assignmentInfo.submission?.improvementTags?.map((tag, idx) => (
                  <Tag text={tag} key={`improve_tag_${idx}`} color="bg-[#e57373]" />
                ))}
              </div>
              <TitleWithIcon text="Comment">
                <CommentIcon color="primary" />
              </TitleWithIcon>
              <p className="font-medium">{assignmentInfo.submission?.comments}</p>
            </div>
          )}
          {!submitted && !afterDeadline() && (
            <div className="pt-4">
              <div className="pb-4">
                <TitleWithIcon text="Submit assignment">
                  <SendIcon color="primary" />
                </TitleWithIcon>
              </div>
              <div className="flex flex-col w-full">
                <div className="w-full pb-5">
                  <TextField
                    id="AssignmentTitle"
                    label="Assignment Title"
                    variant="outlined"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    fullWidth
                  />
                </div>
                <div className="w-full flex justify-between">
                  <div className="flex items-center">
                    <Button
                      variant="outlined"
                      component="label"
                      sx={{ width: "220px" }}
                      startIcon={<DriveFolderUploadIcon />}
                      id="uploadAssignmentMaterial"
                    >
                      Upload Assignment
                      <input
                        id="uploadFileInput"
                        hidden
                        type="file"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          if (e.target.files && e.target.files.length > 0) {
                            setFile(e.target.files[0]);
                          }
                        }}
                      />
                    </Button>
                    {file !== null && (
                      <p className="pl-5">
                        <i>{file.name}</i>
                      </p>
                    )}
                  </div>
                  <Button
                    id="submitAssignmentButton"
                    variant="contained"
                    onClick={handleSubmitAssignment}
                    disabled={title === "" || file === null}
                  >
                    Submit
                  </Button>
                </div>
              </div>
            </div>
          )}
          {!submitted && afterDeadline() && (
            <span className="w-full text-xl font-medium flex flex-col text-center">
              Assignment not submitted before deadline
            </span>
          )}
        </div>
      </div>
    </>
  );
};

export default StudentAssignment;
