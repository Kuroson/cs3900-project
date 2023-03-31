type AssignmentGrade = {
  assignmentId: string;
  title: string;
  maxMarks: number;
  marksAwarded?: number;
  successTags?: Array<string>;
  imrpovementTags?: Array<string>;
};

type QuizGrade = {
  quizId: string;
  title: string;
  maxMarks: number;
  marksAwarded?: number;
  incorrectTags?: Array<string>;
};

export type AnalyticsGradesType = {
  assignmentGrades: Array<AssignmentGrade>;
  quizGrades: Array<QuizGrade>;
};

export type AnalyticsTagSummaryType = {
  successTags: Record<string, number>;
  improvementTags: Record<string, number>;
};

type ChoiceInfo = {
  choiceId: string;
  text: string;
  chosen: boolean;
  correct: boolean;
};

type QuestionInfo = {
  questionId: string;
  text: string;
  tag: string;
  type: string;
  marksAwarded: number;
  marksTotal: number;
  answer?: string;
  choices?: Array<ChoiceInfo>;
};

export type AnalyticsQuestionsType = {
  questions: Array<QuestionInfo>;
};
