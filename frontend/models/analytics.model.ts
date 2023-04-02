export type AssignmentGrade = {
  assignmentId: string;
  title: string;
  maxMarks: number;
  marksAwarded?: number;
  successTags?: Array<string>;
  imrpovementTags?: Array<string>;
};

export type QuizGrade = {
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

export type GradeType = Array<{
  id: string;
  title: string;
  maxMarks: number;
  marksAwarded?: number;
}>;

export type AnalyticsTagSummaryType = {
  successTags: Record<string, number>;
  improvementTags: Record<string, number>;
};

type ChoiceInfo = {
  choiceId: string;
  text: string;
  chosen: boolean;
  correct?: boolean;
};

type QuestionInfo = {
  _id: string;
  text: string;
  tag: string;
  type: string;
  markAwarded: number;
  marks: number;
  response?: string;
  choices?: Array<ChoiceInfo>;
};

export type AnalyticsQuestionsType = {
  questions: Array<QuestionInfo>;
};