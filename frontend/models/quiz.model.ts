export type QuizListType = {
  quizId: string;
  title: string;
  isResponded?: boolean;
  open: string;
  close: string;
};

export type CreateQuizType = {
  courseId: string;
  title: string;
  description: string;
  maxMarks: number;
  open: string;
  close: string;
};

export type QuizQuestionTypeStudent = {
  text: string;
  type: string;
  markAwarded?: number;
  markTotal: number;
  tag: string;
  response: string;
  choices?: Array<{
    text: string;
    correct?: boolean;
    chosen: boolean;
  }>;
};

export type QuizQuestionTypeInstructor = {
  text: string;
  type: string;
  marks: number;
  tag: string;
  choices: Array<{
    text: string;
    correct: boolean;
  }>;
};

export type QuizInfoAfterSubmitType = {
  title: string;
  description: string;
  maxMarks: number;
  marksAwarded?: number; // instructor without that one
  open: string;
  close: string;
  questions?: Array<QuizQuestionTypeStudent>;
};
