import React from "react";
import { Checkbox, TextField } from "@mui/material";
import { QuizQuestionType } from "models/quiz.model";
import Tag from "components/common/Tag";

const label = { inputProps: { "aria-label": "Checkbox choice" } };
const ShowAnswer: React.FC<{ questionInfo: QuizQuestionType; isAdmin: boolean }> = ({
  questionInfo,
  isAdmin,
}) => {
  return (
    <div>
      <div className="flex gap-3">
        {questionInfo.tag && <Tag text={questionInfo.tag} color="bg-[#1e88e5]" />}
        <Tag
          text={`Marks: ${
            questionInfo.markAwarded != null ? questionInfo.markAwarded + "/" : ""
          } ${String(questionInfo.marks)}`}
          color="bg-[#78909c]"
        />
      </div>
      <p className="text-xl mb-2">{questionInfo.text}</p>
      {questionInfo.type === "choice" ? (
        questionInfo.choices?.map((choice, idx) => (
          <div key={`answer_choice_${idx}`} className="flex items-center">
            <Checkbox {...label} checked={choice.correct} disabled />
            <p
              className={`text-xl ${(choice.correct ?? false) && "text-lime-600"} ${
                (choice.chosen ?? choice.correct) !== choice.correct && "text-pink-600"
              }`}
            >
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
        />
      )}
    </div>
  );
};

export default ShowAnswer;
