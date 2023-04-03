import React, { useEffect, useState } from "react";
import { Button, Card, TextField } from "@mui/material";
import { getAllSubmissionsType, submissionType } from "models/assignment.model";
import { useAuthUser } from "next-firebase-auth";
import { getSubmissionsAss } from "util/api/assignmentApi";

type ShowSubmissionsAssProps = {
  courseId: string;
  assignmentId: string;
};

const ShowSubmissionsAss = ({ courseId, assignmentId }: ShowSubmissionsAssProps): JSX.Element => {
  const [submissions, setSubmissions] = useState<getAllSubmissionsType>();
  console.log(
    "🚀 ~ file: ShowSubmissionsAss.tsx:13 ~ ShowSubmissionsAss ~ submissions:",
    submissions,
  );
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
    <div>
      {submissions?.submissions.map((sub, idx) => (
        <Submission key={`submission_${idx}`} info={sub} />
      ))}
    </div>
  );
};

const Submission = ({ info }: { info: submissionType }): JSX.Element => {
  const [marks, setMarks] = useState<number>();
  const [comment, setComment] = useState("");
  return (
    <Card className="p-4 flex flex-col gap-3">
      <h3>{info.title}: </h3>
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
        <Button variant="contained" size="small">
          Send
        </Button>
      </div>
    </Card>
  );
};

export default ShowSubmissionsAss;
