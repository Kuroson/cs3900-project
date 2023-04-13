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

// Admin
type StudentInfo = {
  studentId: string;
  name: string;
};

type StudentGradesType = {
  student: StudentInfo;
  assignmentGrades: Array<AssignmentGrade>;
  quizGrades: Array<QuizGrade>;
};

type QuizType = {
  quizId: string;
  title: string;
  maxMarks: number;
};

type AssignmentType = {
  assignmentId: string;
  title: string;
  maxMarks: number;
};

type GradeSummaryType = {
  studentGrades: Array<StudentGradesType>;
  quizzes: Record<string, QuizType>;
  assignments: Record<string, AssignmentType>;
};

type TagSummaryType = {
  successTags: Record<string, number>;
  improvementTags: Record<string, number>;
};

type ChoiceSummaryInfo = {
  choiceId: string;
  text: string;
  correct: boolean;
};

type QuestionSummaryInfo = {
  questionId: string;
  count: number;
  text: string;
  tag: string;
  type: string;
  marks: number;
  choices?: Array<ChoiceSummaryInfo>;
};

export type AnalyticsSummaryType = {
  tags: TagSummaryType;
  grades: GradeSummaryType;
  questions: Record<string, QuestionSummaryInfo>;
};
