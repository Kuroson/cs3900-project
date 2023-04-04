export type Nullable<T> = { [K in keyof T]: T[K] | null };

export const INSTRUCTOR_NUMBER = 0;
export const STUDENT_NUMBER = 1;

export const getRoleName = (role: number | null): string => {
  if (role === null) return "";
  if (role === INSTRUCTOR_NUMBER) return "Instructor";
  return "Student";
};

export const getCourseURL = (courseCode: string | null): string => {
  return "/" + courseCode;
};

/**
 * Parses a YoutubeURL to get the video ID
 * @param url
 * @returns
 */
export const youtubeURLParser = (url: string): string | false => {
  // https://stackoverflow.com/questions/71000139/javascript-regex-for-youtube-video-and-shorts-id
  const regex = /(youtu.*be.*)\/(watch\?v=|embed\/|v|shorts|)(.*?((?=[&#?])|$))/gm;
  const res = regex.exec(url);
  return res === null ? false : res[3];
};
