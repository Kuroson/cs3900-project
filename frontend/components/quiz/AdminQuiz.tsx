import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
} from "@mui/material";
import dayjs from "dayjs";
import { QuizBasicInfo, QuizInfoType } from "models/quiz.model";
import { useAuthUser } from "next-firebase-auth";
import PageHeader from "components/common/PageHeader";
import { HttpException } from "util/HttpExceptions";
import {
  createNewQuestion,
  deleteQuestion,
  getQuizInfoAdmin,
  updateQuizAdmin,
} from "util/api/quizApi";
import QuizInfoCard from "./QuizInfoCard";
import ShowAnswer from "./ShowAnswer";
import ShowSubmissions from "./ShowSubmissions";

const AdminQuiz: React.FC<{
  quizId: string;
  handleClose: () => void;
  courseId: string;
  courseTags: Array<string>;
}> = ({ quizId, handleClose, courseId, courseTags }): JSX.Element => {
  const authUser = useAuthUser();
  const [quizInfo, setQuizInfo] = useState<QuizInfoType>({
    title: "",
    open: "",
    close: "",
    maxMarks: 0,
    description: "",
    questions: [],
  });
  // add question
  const [addQuestionModal, setAddQuestionModal] = useState(false);
  const [markQuestion, setMarkQuestion] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState("choice");
  const [questionMarks, setQuestionMarks] = useState(0);
  const [questionTag, setQuestionTag] = useState("");
  const [choices, setChoices] = useState<{ text: string; correct: boolean }[]>([]);
  const isBeforeOpen = dayjs.utc() < dayjs.utc(quizInfo.open);
  const isClosed = dayjs.utc() > dayjs.utc(quizInfo.close);

  useEffect(() => {
    const getQuizInfo = async () => {
      const [res, err] = await getQuizInfoAdmin(await authUser.getIdToken(), quizId, "client");
      if (err !== null) {
        console.error(err);
      }

      if (res === null) throw new Error("Response and error are null");
      setQuizInfo(res);
    };
    getQuizInfo();
  }, [authUser, quizId]);

  const canEditQuiz = () => {
    // Can only edit quiz before opening
    const isOpen = new Date() > new Date(Date.parse(quizInfo.open));

    if (isOpen) {
      toast.error("Can only edit quiz before opening");
    }
    return !isOpen;
  };

  // edit quiz info
  const handleEditInfo = async (newInfo: QuizBasicInfo) => {
    if (!canEditQuiz()) return;

    const [res, err] = await updateQuizAdmin(
      await authUser.getIdToken(),
      { ...newInfo, quizId: quizId },
      "client",
    );
    if (err !== null) {
      console.error(err);
      if (err instanceof HttpException) {
        toast.error(err.message);
      } else {
        toast.error("Failed to edit quiz");
      }
      return;
    }
    if (res === null) throw new Error("Shouldn't happen");
    toast.success("Edited quiz successfully");

    setQuizInfo((prev) => ({
      questions: prev?.questions ?? [],
      title: newInfo.title,
      open: newInfo.open,
      close: newInfo.close,
      description: newInfo.description,
      maxMarks: newInfo.maxMarks,
    }));
  };

  const handleAddQuestion = async () => {
    if (!canEditQuiz()) {
      setAddQuestionModal((prev) => !prev);
      return;
    }

    const newQuestion = {
      text: questionText,
      type: questionType,
      marks: questionMarks,
      choices: choices,
      tag: questionTag,
    };
    const [res, err] = await createNewQuestion(
      await authUser.getIdToken(),
      {
        courseId: courseId,
        quizId: quizId,
        ...newQuestion,
      },
      "client",
    );
    if (err !== null) {
      console.error(err);
      if (err instanceof HttpException) {
        toast.error(err.message);
      } else {
        toast.error("Failed to add question in the quiz");
      }
      return;
    }
    if (res === null) throw new Error("Shouldn't happen");
    toast.success("Added question in quiz successfully");

    setQuizInfo((prev) => ({
      ...prev,
      questions: [...(prev?.questions ?? []), { ...newQuestion, _id: res.questionId }],
    }));

    setAddQuestionModal((prev) => !prev);
    setQuestionText("");
    setQuestionMarks(0);
    setQuestionTag("");
    setQuestionType("choice");
    setChoices([]);
  };

  const handleDeleteQuestion = async (questionId: string, idx: number) => {
    if (!canEditQuiz()) return;

    const [res, err] = await deleteQuestion(
      await authUser.getIdToken(),
      {
        quizId: quizId,
        questionId: questionId,
      },
      "client",
    );
    if (err !== null) {
      console.error(err);
      if (err instanceof HttpException) {
        toast.error(err.message);
      } else {
        toast.error("Failed to delete question");
      }
      return;
    }
    toast.success("Deleted question successfully");

    setQuizInfo((prev) => {
      prev.questions.splice(idx, 1);
      return { ...prev };
    });
  };

  return (
    <>
      <PageHeader title={quizInfo?.title ?? ""}>
        <Button variant="outlined" onClick={handleClose}>
          Back
        </Button>
      </PageHeader>
      <div className="mt-7 mx-auto flex flex-col gap-9 w-full max-w-[800px]">
        <QuizInfoCard
          info={{
            title: quizInfo.title,
            description: quizInfo.description,
            maxMarks: quizInfo.maxMarks,
            open: quizInfo.open,
            close: quizInfo.close,
          }}
          isAdmin={true}
          handleEditInfo={handleEditInfo}
        />
        {isClosed && (
          <div className="flex justify-center items-center gap-2">
            <Button onClick={() => setMarkQuestion(false)}>Show all questions</Button>
            <Divider orientation="vertical" sx={{ height: "20px" }} />
            <Button onClick={() => setMarkQuestion(true)}>Mark Open Questions</Button>
          </div>
        )}
        {markQuestion ? (
          <ShowSubmissions courseId={courseId} quizId={quizId} />
        ) : (
          quizInfo.questions.map((question, idx) => (
            <ShowAnswer
              key={`answer+${idx}`}
              questionInfo={question}
              isAdmin={true}
              handleDelete={() => handleDeleteQuestion(question._id ?? "", idx)}
              isBeforeOpen={isBeforeOpen}
            />
          ))
        )}
        {isBeforeOpen && (
          <Button onClick={() => setAddQuestionModal((prev) => !prev)} variant="outlined">
            Add Question
          </Button>
        )}
        <Modal
          open={addQuestionModal}
          onClose={() => setAddQuestionModal((prev) => !prev)}
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
                type="number"
                value={questionMarks}
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
            <Button variant="contained" disabled={questionText === ""} onClick={handleAddQuestion}>
              Add Question
            </Button>
          </Box>
        </Modal>
      </div>
    </>
  );
};

export default AdminQuiz;
