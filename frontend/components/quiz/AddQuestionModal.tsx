import React, { useState } from "react";
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
import { QuizQuestionType } from "models/quiz.model";

type AddQuestionModalProps = {
  open: boolean;
  setOpen: (value: React.SetStateAction<boolean>) => void;
  courseTags: Array<string>;
  handleAddQuestion: (newQuestion: QuizQuestionType, clearForm: () => void) => Promise<void>;
};

const AddQuestionModal: React.FC<AddQuestionModalProps> = ({
  open,
  setOpen,
  courseTags,
  handleAddQuestion,
}): JSX.Element => {
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState("choice");
  const [questionMarks, setQuestionMarks] = useState(0);
  const [questionTag, setQuestionTag] = useState("");
  const [choices, setChoices] = useState<{ text: string; correct: boolean }[]>([]);

  const clearForm = () => {
    setQuestionText("");
    setQuestionMarks(0);
    setQuestionTag("");
    setQuestionType("choice");
    setChoices([]);
  };

  return (
    <Modal
      open={open}
      onClose={() => setOpen((prev) => !prev)}
      aria-labelledby="add question"
      aria-describedby="add question"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "100vw",
          maxWidth: "700px",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 20,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <h2>Add Question</h2>
        <TextField
          id="question text"
          label="Question Text"
          variant="outlined"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
        />
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: "20px" }}>
          <FormControl fullWidth>
            <InputLabel id="question-tag-label">Question Tag</InputLabel>
            <Select
              labelId="question-tag-label"
              id="question tag"
              label="Question Tag"
              value={questionTag}
              onChange={(e) => setQuestionTag(e.target.value as string)}
              fullWidth
            >
              {courseTags.map((tag) => {
                return (
                  <MenuItem value={tag} key={tag}>
                    {tag}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <TextField
            id="question marks"
            label="Question marks"
            variant="outlined"
            value={questionMarks}
            type="number"
            onChange={(e) => setQuestionMarks(+e.target.value)}
            fullWidth
          />
        </Box>
        <FormControl fullWidth>
          <InputLabel id="question type">Type</InputLabel>
          <Select
            labelId="select type"
            id="select type"
            value={questionType}
            label="choice"
            onChange={(e) => setQuestionType(e.target.value)}
          >
            <MenuItem value="choice">Choice question</MenuItem>
            <MenuItem value="open">Open question</MenuItem>
          </Select>
        </FormControl>
        {questionType === "choice" && (
          <Box sx={{ display: "flex", gap: "10px", flexDirection: "column" }}>
            {choices?.map((choice, idx) => (
              <Box key={`choice_${idx}`} sx={{ display: "flex", gap: "10px" }}>
                <Checkbox
                  value={choice.correct}
                  onChange={(e) =>
                    setChoices((prev) => {
                      prev[idx].correct = e.target.checked;
                      return [...prev];
                    })
                  }
                />
                <TextField
                  id={`choice_text_${idx}`}
                  label="Choice Text"
                  variant="outlined"
                  fullWidth
                  value={choice.text}
                  onChange={(e) =>
                    setChoices((prev) => {
                      prev[idx].text = e.target.value;
                      return [...prev];
                    })
                  }
                />
                <IconButton
                  aria-label="delete"
                  onClick={() =>
                    setChoices((prev) => {
                      prev.splice(idx, 1);
                      return [...prev];
                    })
                  }
                >
                  <DeleteIcon color="error" />
                </IconButton>
              </Box>
            ))}
            <Button
              startIcon={<AddIcon />}
              sx={{ width: "fit-content" }}
              onClick={() => setChoices((prev) => [...prev, { text: "", correct: false }])}
            >
              Add Choice
            </Button>
          </Box>
        )}
        <Button
          variant="contained"
          disabled={questionText === ""}
          onClick={() => {
            handleAddQuestion(
              {
                text: questionText,
                type: questionType,
                marks: questionMarks,
                choices: choices,
                tag: questionTag,
              },
              clearForm,
            );
          }}
        >
          Add Question
        </Button>
      </Box>
    </Modal>
  );
};

export default AddQuestionModal;
