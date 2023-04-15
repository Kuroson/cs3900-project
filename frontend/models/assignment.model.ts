export type AssignmentListType = {
  assignmentId: string;
  title: string;
  description?: string;
  deadline: string;
  task?: string;
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
  markAwarded?: number;
  task?: string;
};

export type SubmitAssignmentType = {
  courseId: string;
  assignmentId: string;
  title: string;
  timeSubmitted: string;
};

export type SubmitAssignmentResponseType = {
  submissionId: string;
  fileType: string;
  linkToSubmission: string; // i.e., download link
  timeSubmitted: number;
};

export type submissionType = {
  submissionId: string;
  studentId: string;
  title: string;
  linkToSubmission: string;
  fileType: string;
  studentName: string;
  studentAvatar: string;
};

export type getAllSubmissionsType = {
  assignment: {
    assignmentId: string;
    title: string;
    marks: string;
    tags: Array<string>;
  };
  submissions: Array<submissionType>;
};

export type gradingType = {
  submissionId: string;
  mark: number;
  comment: string;
  successTags: Array<string>;
  improvementTags: Array<string>;
  assignmentId: string;
};
