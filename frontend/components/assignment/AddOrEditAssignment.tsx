import React, { useState } from "react";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import {
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { AssignmentInfoType, CreateAssignmentType } from "models/assignment.model";
import PageHeader from "components/common/PageHeader";
import TitleWithIcon from "components/common/TitleWithIcon";

type AddOrEditAssignmentProps = {
  handleAddNewAssignment?: (newAssignment: CreateAssignmentType) => void;
  closeAssignment: () => void;
  courseId?: string;
  courseTags: Array<string>;
  info?: AssignmentInfoType;
  isEditing: boolean;
  handleEditInfo?: (newInfo: AssignmentInfoType) => void;
};

// Add or edit assignment info for admin
const AddOrEditAssignment: React.FC<AddOrEditAssignmentProps> = ({
  handleAddNewAssignment,
  closeAssignment,
  courseId,
  courseTags,
  info,
  isEditing,
  handleEditInfo,
}): JSX.Element => {
  const [title, setTitle] = useState(info?.title ?? "");
  const [description, setDescription] = useState(info?.description ?? "");
  const [tags, setTags] = useState<string[]>(info?.tags ?? []);
  const [marksAvailable, setMarksAvailable] = useState(info?.marksAvailable ?? 0);
  const [deadline, setDeadline] = useState<Dayjs>(
    info?.deadline != null ? dayjs.utc(info.deadline).local() : dayjs().add(1, "day"),
  );

  const addNewAssignment = () => {
    const newAssignment: CreateAssignmentType = {
      courseId: courseId ?? "",
      title: title,
      description: description,
      marksAvailable: marksAvailable,
      deadline: deadline.format(),
      tags: tags,
    };
    if (handleAddNewAssignment) {
      handleAddNewAssignment(newAssignment);
    }
  };

  const handleTagChange = (event: SelectChangeEvent<typeof tags>) => {
    const {
      target: { value },
    } = event;
    setTags(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value,
    );
  };

  return (
    <>
      <PageHeader title={isEditing ? "Edit Assignment" : "Add New Assignment"} />
      <Box
        sx={{
          margin: "auto",
          marginTop: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          width: "100%",
          maxWidth: "800px",
        }}
      >
        <TextField
          id="assignment name"
          variant="outlined"
          label="Assignment Title"
          sx={{ width: "100%", maxWidth: "800px" }}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField
          id="assignment description"
          variant="outlined"
          label="Assignment Description"
          sx={{ width: "100%", maxWidth: "800px" }}
          multiline
          rows={7}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <TextField
          id="max mark"
          label="Max Mark"
          type="number"
          variant="outlined"
          sx={{ width: "100%", maxWidth: "800px" }}
          value={marksAvailable}
          onChange={(e) => setMarksAvailable(+e.target.value)}
        />
        <FormControl sx={{ width: "100%", maxWidth: "800px" }}>
          <InputLabel id="select-tags-label">Tags</InputLabel>
          <Select
            labelId="select-tags-label"
            id="select-tags"
            multiple
            value={tags}
            onChange={handleTagChange}
            input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
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
        {/* timing */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <div>
            <TitleWithIcon text="Timing">
              <AccessTimeIcon color="primary" />
            </TitleWithIcon>
            <Box
              sx={{
                display: "flex",
                gap: "9px",
                marginTop: "6px",
                flexDirection: "column",
              }}
            >
              <h3>Assignment deadline</h3>
              <DateTimePicker
                views={["year", "month", "day", "hours", "minutes"]}
                sx={{ width: "100%", maxWidth: "300px" }}
                value={deadline}
                onChange={(value) => {
                  if (value) {
                    setDeadline(value);
                  }
                }}
              />
            </Box>
          </div>
        </LocalizationProvider>
        <Box sx={{ display: "flex", gap: "10px", maxWidth: "800px", justifyContent: "end" }}>
          <Button variant="outlined" onClick={closeAssignment}>
            Cancel
          </Button>
          {!isEditing ? (
            <Button variant="contained" disabled={!title} onClick={addNewAssignment}>
              Add Assignment
            </Button>
          ) : (
            <Button
              variant="contained"
              disabled={!title}
              onClick={() => {
                if (!handleEditInfo) return;
                handleEditInfo({
                  title: title,
                  deadline: deadline.format(),
                  description: description,
                  marksAvailable: marksAvailable,
                  tags: tags,
                });
                closeAssignment();
              }}
            >
              Edit Assignment
            </Button>
          )}
        </Box>
      </Box>
    </>
  );
};

export default AddOrEditAssignment;
