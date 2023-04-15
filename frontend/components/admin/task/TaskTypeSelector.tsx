import React from "react";
import { toast } from "react-toastify";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { Box } from "@mui/system";
import { AssignmentListType } from "models/assignment.model";
import { QuizListType } from "models/quiz.model";
import { AuthUserContext, useAuthUser } from "next-firebase-auth";
import { HttpException } from "util/HttpExceptions";
import { getListOfAssignments } from "util/api/assignmentApi";
import { getListOfQuizzes, getQuizInfoAdmin } from "util/api/quizApi";

type TaskTypeSelectorProps = {
  courseId: string;
  taskType: string;
  quizzes: QuizListType[];
  assignments: AssignmentListType[];
  //onlineClasses:
};

const TaskTypeSelector = ({ courseId, taskType }: TaskTypeSelectorProps): JSX.Element => {
  const authUser = useAuthUser();

  React.useEffect(() => {
    if (taskType === "quiz") {
      //getQuizzes(courseId, authUser);
    } else if (taskType === "assignment") {
      // fetch assignment
    } else if (taskType === "onlineclass") {
      //fetch nothing
    }
  }, [taskType]);

  return (
    <></>
    // <Box sx={{ minWidth: 120 }}>
    //   <FormControl fullWidth>
    //     <InputLabel id="demo-simple-select-label">Age</InputLabel>
    //     <Select
    //       labelId="demo-simple-select-label"
    //       id="demo-simple-select"
    //       value={age}
    //       label="Age"
    //       onChange={handleChange}
    //     >
    //       <MenuItem value={10}>Ten</MenuItem>
    //       <MenuItem value={20}>Twenty</MenuItem>
    //       <MenuItem value={30}>Thirty</MenuItem>
    //     </Select>
    //   </FormControl>
    // </Box>
  );
};

// const getQuizzes = async (courseId: string, authUser: AuthUserContext) => {
//   const [res, err] = await getListOfQuizzes(await authUser.getIdToken(), courseId, "client");
//   if (err !== null) {
//     console.error(err);
//     if (err instanceof HttpException) {
//       toast.error(err.message);
//     } else {
//       toast.error(err);
//     }
//     return;
//   }
//   if (res === null) throw new Error("Response and error are null");
//   // setQuizList(res.quizzes);

//   // Iterate through list of quizzes, don't get the closed or the ones with tasks.
//   const newQuiz = res.quizzes.filter(
//     (x) => x.task !== undefined || new Date() > new Date(Date.parse(x.close)),
//   );
// };

// const getAssignments = async (courseId: string, authUser: AuthUserContext) => {
//   const [res, err] = await getListOfAssignments(await authUser.getIdToken(), courseId, "client");
//   if (err !== null) {
//     console.error(err);
//     if (err instanceof HttpException) {
//       toast.error(err.message);
//     } else {
//       toast.error(err);
//     }
//     return;
//   }
//   if (res === null) throw new Error("Response and error are null");

//   const newQuiz = res.assignments.filter(
//     (x) => x.task !== undefined || new Date() > new Date(Date.parse(x.deadline)),
//   );
// };
