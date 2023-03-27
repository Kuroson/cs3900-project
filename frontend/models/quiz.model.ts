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

export type QuizBasicInfo = {
  title: string;
  description: string;
  maxMarks: number;
  markAwarded?: number; // just for student
  open: string;
  close: string;
};

// admin
export type QuizQuestionTypeAdmin = {
  _id?: string;
  text: string;
  type: string;
  marks: number;
  tag: string;
  choices: Array<{
    text: string;
    correct: boolean;
  }>;
};

export type QuizInfoTypeAdmin = {
  title: string;
  description: string;
  maxMarks: number;
  open: string;
  close: string;
  questions: Array<QuizQuestionTypeAdmin>;
};

// student
export type QuizQuestionTypeStudent = {
  text: string;
  type: string;
  markAwarded?: number; // admin without that one
  markTotal: number;
  tag: string;
  response: string;
  choices?: Array<{
    text: string;
    correct?: boolean;
    chosen: boolean; // admin without that one
  }>;
};

export type QuizInfoAfterSubmitType = {
  title: string;
  description: string;
  maxMarks: number;
  marksAwarded?: number; // admin without that one
  open: string;
  close: string;
  questions?: Array<QuizQuestionTypeStudent>;
};

export type QuizInfoBeforeSubmitType = {
  title: string;
  description: string;
  maxMarks: number;
  open: string;
  close: string;
  questions: Array<{
    _id: string;
    text: string;
    type: string;
    marks: number;
    choices?: Array<{
      _id: string;
      text: string;
    }>;
  }>;
};
