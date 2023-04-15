import React from "react";
import { toast } from "react-toastify";
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { Box, maxWidth } from "@mui/system";
import { AssignmentListType } from "models/assignment.model";
import { OnlineClassInterface } from "models/onlineClass.model";
import { QuizListType } from "models/quiz.model";
import { AuthUserContext, useAuthUser } from "next-firebase-auth";
import { HttpException } from "util/HttpExceptions";
import { getListOfAssignments } from "util/api/assignmentApi";
import { getListOfQuizzes, getQuizInfoAdmin } from "util/api/quizApi";

type TaskTypeSelectorProps = {
  courseId: string;
  taskType: string;
  onlineClasses: OnlineClassInterface[];
  quiz: string | undefined;
  setQuiz: React.Dispatch<React.SetStateAction<string | undefined>>;
  assignment: string | undefined;
  setAssignment: React.Dispatch<React.SetStateAction<string | undefined>>;
  onlineClass: string | undefined;
  setOnlineClass: React.Dispatch<React.SetStateAction<string | undefined>>;
};

const TaskTypeSelector = ({
  courseId,
  taskType,
  onlineClasses,
  quiz,
  setQuiz,
  assignment,
  setAssignment,
  setOnlineClass,
  onlineClass,
}: TaskTypeSelectorProps): JSX.Element => {
  const authUser = useAuthUser();

  const [quizzes, setQuizzes] = React.useState<QuizListType[]>();
  const [assignments, setAssignments] = React.useState<AssignmentListType[]>();

  React.useEffect(() => {
    setQuiz(undefined);
    setAssignment(undefined);
    setOnlineClass(undefined);
    if (taskType === "quiz") {
      getQuizzes(courseId, authUser, setQuizzes);
    } else if (taskType === "assignment") {
      getAssignments(courseId, authUser, setAssignments);
    }
  }, [taskType]);

  const handleChange = async (event: SelectChangeEvent) => {
    if (taskType === "quiz") {
      setQuiz(event.target.value as string);
      setAssignment(undefined);
      setOnlineClass(undefined);
    } else if (taskType === "assignment") {
      setQuiz(undefined);
      setAssignment(event.target.value as string);
      setOnlineClass(undefined);
    } else if (taskType === "onlineclass") {
      setQuiz(undefined);
      setAssignment(undefined);
      setOnlineClass(event.target.value as string);
    }
  };
  console.log(taskType, quiz, assignment, onlineClass);

  if (taskType === "quiz") {
    return (
      <Box sx={{ minWidth: 120, maxWidth: 300 }}>
        <FormControl fullWidth>
          <InputLabel>Select Quiz</InputLabel>
          <Select onChange={handleChange}>
            {quizzes?.map((quiz) => {
              return <MenuItem value={quiz.quizId}>{quiz.title}</MenuItem>;
            })}
          </Select>
        </FormControl>
      </Box>
    );
  } else if (taskType === "assignment") {
    return (
      <Box sx={{ minWidth: 120, maxWidth: 300 }}>
        <FormControl fullWidth>
          <InputLabel>Select Assignment</InputLabel>
          <Select onChange={handleChange}>
            {assignments?.map((assignment) => {
              return <MenuItem value={assignment.assignmentId}>{assignment.title}</MenuItem>;
            })}
          </Select>
        </FormControl>
      </Box>
    );
  } else if (taskType === "onlineclass") {
    return (
      <Box sx={{ minWidth: 120, maxWidth: 300 }}>
        <FormControl fullWidth>
          <InputLabel>Select Online Class</InputLabel>
          <Select onChange={handleChange}>
            {onlineClasses.map((onlineClass) => {
              return <MenuItem value={onlineClass._id}>{onlineClass.title}</MenuItem>;
            })}
          </Select>
        </FormControl>
      </Box>
    );
  } else {
    return <></>;
  }
};

const getQuizzes = async (
  courseId: string,
  authUser: AuthUserContext,
  setQuizzes: React.Dispatch<React.SetStateAction<QuizListType[] | undefined>>,
) => {
  const [res, err] = await getListOfQuizzes(await authUser.getIdToken(), courseId, "client");
  if (err !== null) {
    console.error(err);
    if (err instanceof HttpException) {
      toast.error(err.message);
    } else {
      toast.error(err);
    }
    return;
  }
  if (res === null) throw new Error("Response and error are null");

  // Iterate through list of quizzes, don't get the closed or the ones with tasks.
  const newQuiz = res.quizzes.filter(
    (x) => x.task === undefined && new Date() < new Date(Date.parse(x.close)),
  );
  setQuizzes(newQuiz);
  return newQuiz;
};

const getAssignments = async (
  courseId: string,
  authUser: AuthUserContext,
  setAssignments: React.Dispatch<React.SetStateAction<AssignmentListType[] | undefined>>,
) => {
  const [res, err] = await getListOfAssignments(await authUser.getIdToken(), courseId, "client");
  if (err !== null) {
    console.error(err);
    if (err instanceof HttpException) {
      toast.error(err.message);
    } else {
      toast.error(err);
    }
    return;
  }
  if (res === null) throw new Error("Response and error are null");

  const newAssignment = res.assignments.filter(
    (x) => x.task === undefined && new Date() < new Date(Date.parse(x.deadline)),
  );
  setAssignments(newAssignment);

  return newAssignment;
};

export default TaskTypeSelector;
