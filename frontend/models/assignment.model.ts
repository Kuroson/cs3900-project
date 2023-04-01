export type AssignmentListType = {
  assignmentId: string;
  title: string;
  description?: string;
  deadline: string;
};

export type CreateAssignmentType = {
  courseId: string;
  title: string;
  description?: string;
  deadline: string;
  marksAvailable: number;
  tags: Array<string>;
};

type SubmissionInfo = {
  title: string;
  linkToSubmission: string;
  mark?: number;
  comments?: string;
  successTags?: Array<string>;
  improvementTags?: Array<string>;
};

export type AssignmentInfoType = {
  title: string;
  description?: string;
  deadline: string;
  marksAvailable: number;
  tags: Array<string>;
  submission?: SubmissionInfo; // just for student
};

export type SubmitAssignmentType = {
  courseId: string;
  assignmentId: string;
  title: string;
};
