export type QuizListType = {
  quizId: string;
  title: string;
  isResponded?: boolean;
  open: string;
  close: string;
  task?: string;
};

export type CreateQuizType = {
  courseId: string;
  title: string;
  description: string;
  maxMarks: number;
  open: string;
  close: string;
};

// for card in quiz
export type QuizBasicInfo = {
  title: string;
  description: string;
  maxMarks: number;
  markAwarded?: number; // just for student
  open: string;
  close: string;
  task?: string;
};

// for showing answers in admin/student page
export type QuizQuestionType = {
  _id?: string;
  text: string;
  type: string;
  markAwarded?: number; // student
  marks: number;
  tag: string;
  response?: string; // student
  choices?: Array<{
    _id?: string;
    text: string;
    correct?: boolean; // not show if not submit
    chosen?: boolean; // student
  }>;
};

// gets quiz info
export type QuizInfoType = {
  title: string;
  description: string;
  maxMarks: number;
  marksAwarded?: number; // just for student
  open: string;
  close: string;
  questions: Array<QuizQuestionType>;
  task?: string;
};

export type ResponsesType = {
  questionId: string;
  choiceId?: Array<string>; //todo
  answer?: string;
};

export type SubmitQuizType = {
  courseId: string;
  quizId: string;
  responses: Array<ResponsesType>;
};

export type StudentResponseType = {
  responseId: string;
  studentId: string;
  answer: string;
  studentName: string;
  studentAvatar?: string;
};

export type EachQuestionSubmissionsType = {
  question: {
    questionId: string;
    text: string;
    marks: number;
    tag: string;
  };
  responses: Array<StudentResponseType>;
};

export type QuizSubmissionsType = {
  submissions: Array<EachQuestionSubmissionsType>;
};

export type markSubmission = {
  questionId: string;
  responseId: string;
  mark: number;
};
