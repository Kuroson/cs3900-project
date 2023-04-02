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
 * https://stackoverflow.com/questions/3452546/how-do-i-get-the-youtube-video-id-from-a-url
 * @param url
 * @returns
 */
export const youtubeURLParser = (url: string): string | false => {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7].length == 11 ? match[7] : false;
};
