import React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { GradeType } from "models/analytics.model";

type GradeTableProps = {
  tableTitle: string;
  rows: GradeType;
};

const GradeTable: React.FC<GradeTableProps> = ({ tableTitle, rows }) => {
  return (
    <>
      <div className="mb-3 flex gap-9 w-full max-w-[800px]">
        <Typography>
          <h4>
            <i>{tableTitle} Grades</i>
          </h4>
        </Typography>
      </div>
      <div className="mt-2 mb-5 flex flex-col items-center gap-9 w-full">
        <TableContainer sx={{ width: "90%" }} component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>
                  <b>{tableTitle}</b>
                </TableCell>
                <TableCell align="center">
                  <b>Mark Awarded</b>
                </TableCell>
                <TableCell align="center">
                  <b>Maximum Mark</b>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                  <TableCell component="th" scope="row">
                    {row.title}
                  </TableCell>
                  <TableCell align="center">{row.marksAwarded ?? "?"}</TableCell>
                  <TableCell align="center">{row.maxMarks}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </>
  );
};

export default GradeTable;
