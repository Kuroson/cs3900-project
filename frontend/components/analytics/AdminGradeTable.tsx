import React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { GradeSummaryType } from "models/analytics.model";

type AdminGradeTableProps = {
  tableTitle: "Quiz" | "Assignment";
  data: GradeSummaryType;
};

const AdminGradeTable: React.FC<AdminGradeTableProps> = ({ tableTitle, data }) => {
  const [order, setOrder] = React.useState<Array<Array<string | number>>>([]);

  React.useEffect(() => {
    // Organise order
    const constructOrder: Array<Array<string | number>> = [];
    if (tableTitle === "Quiz") {
      for (const item of Object.keys(data.quizzes)) {
        constructOrder.push([item, data.quizzes[item].title, data.quizzes[item].maxMarks]);
      }
    } else {
      for (const item of Object.keys(data.assignments)) {
        constructOrder.push([item, data.assignments[item].title, data.assignments[item].maxMarks]);
      }
    }
    setOrder(constructOrder);
  }, [tableTitle, data]);

  return (
    <>
      <div className="mb-3 flex gap-9 w-full max-w-[800px]">
        <h4>
          <i>{tableTitle} Grades</i>
        </h4>
      </div>
      <div className="mt-2 mb-5 flex flex-col items-center gap-9 w-full">
        <TableContainer sx={{ width: "90%" }} component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>
                  <b>Student</b>
                </TableCell>
                {order.map((item, idx) => (
                  <TableCell key={idx} align="center">
                    <b>
                      {item[1]} (/{item[2]})
                    </b>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.studentGrades.map((studentGrade, idx) => (
                <TableRow
                  key={studentGrade.student.studentId}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {studentGrade.student.name}
                  </TableCell>
                  {order.map((item, idx) => (
                    <TableCell key={idx} align="center">
                      {item[0] in studentGrade.grades ? (
                        <>{studentGrade.grades[item[0]]}</>
                      ) : (
                        <>-</>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </>
  );
};

export default AdminGradeTable;
