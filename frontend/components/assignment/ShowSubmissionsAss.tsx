import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material";
import { useAuthUser } from "next-firebase-auth";
import { HttpException } from "util/HttpExceptions";
import { getSubmissionsAss, gradeSubmission } from "util/api/assignmentApi";
import { getAllSubmissionsType, submissionType } from "models/assignment.model";

type ShowSubmissionsAssProps = {
  courseId: string;
  assignmentId: string;
  courseTags: Array<string>;
};

const ShowSubmissionsAss = ({
  courseId,
  assignmentId,
  courseTags,
}: ShowSubmissionsAssProps): JSX.Element => {
  const [submissions, setSubmissions] = useState<getAllSubmissionsType>();
  const authUser = useAuthUser();

  useEffect(() => {
    const getSubmissions = async () => {
      const [res, err] = await getSubmissionsAss(
        await authUser.getIdToken(),
        courseId,
        assignmentId,
        "client",
      );
      if (err !== null) {
        console.error(err);
      }

      if (res === null) throw new Error("Response and error are null");
      setSubmissions(res);
    };
    getSubmissions();
  }, [assignmentId, authUser, courseId]);

  return (
    <div className="flex flex-col gap-4">
      {submissions?.submissions.map((sub, idx) => (
        <Submission
          key={`submission_${idx}`}
          info={sub}
          courseTags={courseTags}
          assignmentId={assignmentId}
        />
      ))}
    </div>
  );
};

const Submission = ({
  info,
  courseTags,
  assignmentId,
}: {
  info: submissionType;
  courseTags: string[];
  assignmentId: string;
}): JSX.Element => {
  const [marks, setMarks] = useState<number>();
  const [comment, setComment] = useState("");
  const [goodTags, setGoodTags] = useState<string[]>([]);
  const [improveTags, setImproveTags] = useState<string[]>([]);
  const getNameInitial = info.studentName.split(" ");
  const authUser = useAuthUser();

  const handleTagChange = (event: SelectChangeEvent<string[]>, isGoodTags: boolean) => {
    const {
      target: { value },
    } = event;
    if (isGoodTags) {
      setGoodTags(typeof value === "string" ? value.split(",") : value);
    } else {
      setImproveTags(typeof value === "string" ? value.split(",") : value);
    }
  };

  const handleSubmit = async () => {
    const [res, err] = await gradeSubmission(
      await authUser.getIdToken(),
      {
        submissionId: info.submissionId,
        mark: marks ?? 0,
        comment: comment,
        successTags: goodTags,
        improvementTags: improveTags,
        assignmentId: assignmentId,
      },
      "client",
    );
    if (err !== null) {
      console.error(err);
      if (err instanceof HttpException) {
        toast.error(err.message);
      } else {
        toast.error("Failed to mark assignment");
      }
      return;
    }
    if (res === null) throw new Error("Shouldn't happen");
    toast.success("Marked assignment successfully");
  };

  return (
    <Card className="p-4 flex flex-col gap-6">
      <div className="flex gap-3 items-center">
        <Avatar src={info.studentAvatar}>
          {getNameInitial[0][0]}
          {getNameInitial[1][0]}
        </Avatar>
        <h3>{info.studentName}</h3>
      </div>
      <div className="flex gap-4 items-center">
        <h3>{info.title} </h3>
        <Link href={info.linkToSubmission} target="_blank">
          <Button variant="outlined">Download File</Button>
        </Link>
      </div>
      <div className="flex justify-center gap-3 flex-col">
        <TextField
          label="Marks"
          variant="outlined"
          type="number"
          onChange={(e) => setMarks(+e.target.value)}
        />
        <TextField
          label="Comment"
          variant="outlined"
          multiline
          rows={4}
          onChange={(e) => setComment(e.target.value)}
        />
        <FormControl>
          <InputLabel id="good-tags">Success Tags</InputLabel>
          <Select
            multiple
            value={goodTags}
            onChange={(e) => handleTagChange(e, true)}
            input={<OutlinedInput label="Chip" />}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
          >
            {courseTags.map((tag) => (
              <MenuItem key={tag} value={tag}>
                {tag}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <InputLabel id="improve-tags">Improvement Tags</InputLabel>
          <Select
            multiple
            value={improveTags}
            onChange={(e) => handleTagChange(e, false)}
            input={<OutlinedInput label="Chip" />}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
          >
            {courseTags.map((tag) => (
              <MenuItem key={tag} value={tag}>
                {tag}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" size="small" onClick={handleSubmit}>
          Mark Assignment
        </Button>
      </div>
    </Card>
  );
};

export default ShowSubmissionsAss;
