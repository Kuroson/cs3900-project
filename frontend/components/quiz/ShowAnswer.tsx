import React from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { Checkbox, IconButton, TextField } from "@mui/material";
import { QuizQuestionType } from "models/quiz.model";
import Tag from "components/common/Tag";

type ShowAnswerProps = {
  questionInfo: QuizQuestionType;
  isAdmin: boolean;
  handleDelete?: () => void;
  isBeforeOpen?: boolean;
};

const label = { inputProps: { "aria-label": "Checkbox choice" } };
const ShowAnswer: React.FC<ShowAnswerProps> = ({
  questionInfo,
  isAdmin,
  handleDelete,
  isBeforeOpen,
}) => {
  return (
    <div>
      <div className="flex gap-3 items-center">
        {questionInfo.tag && <Tag text={questionInfo.tag} color="bg-[#009688]" />}
        <Tag
          text={`Marks: ${
            questionInfo.markAwarded != null ? questionInfo.markAwarded + "/" : "?/"
          } ${String(questionInfo.marks)}`}
          color="bg-[#78909c]"
        />
        {isAdmin && (isBeforeOpen ?? false) && (
          <IconButton aria-label="delete" onClick={handleDelete}>
            <DeleteIcon color="error" />
          </IconButton>
        )}
      </div>
      <p className="text-xl my-2">{questionInfo.text}</p>
      {questionInfo.type === "choice" ? (
        questionInfo.choices?.map((choice, idx) => (
          <div key={`answer_choice_${idx}`} className="flex items-center">
            <Checkbox
              {...label}
              checked={isAdmin ? choice.correct ?? false : choice.chosen ?? false}
              disabled
            />
            <p className={`text-xl ${(choice.correct ?? false) && "text-green-600 "}`}>
              {choice.text}
            </p>
          </div>
        ))
      ) : (
        <TextField
          multiline
          rows={5}
          fullWidth
          variant="outlined"
          label="Answer"
          value={questionInfo?.response}
          disabled
          InputLabelProps={{ shrink: true }}
        />
      )}
    </div>
  );
};

export default ShowAnswer;
