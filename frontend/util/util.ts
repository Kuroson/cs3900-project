export type Nullable<T> = { [K in keyof T]: T[K] | null };

export const INSTRUCTOR_NUMBER = 0;
export const STUDENT_NUMBER = 1;

export const getRoleName = (role: number | null): string => {
  if (role === null) return "";
  if (role === INSTRUCTOR_NUMBER) return "Instructor";
  return "Student";
};

export type CourseGETResponse = {
  courses: CourseInformation[];
};

// NOTE: some fetches dont have courseiD??
export type CourseInformation = {
  courseId: string;
  title: string;
  code: string;
  description: string;
  session: string;
  icon: string;
};

export type CourseInformationFull = CourseInformation & {
  pages: CoursePage[];
};

export type CoursePageSection = {
  title: string;
  resources: CourseResource[];
};

export type CourseResource = {
  title: string;
  description: string;
  fileType: string;
  storedName: string;
};

export type CoursePage = {
  title: string;
  sections: CoursePageSection[];
  resources: CourseResource[];
  pageId: string;
};
