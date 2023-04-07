import { getUserDetails } from "./api/userApi";

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

// From COMP6080 starter code
/**
 * Given a js file object representing a jpg or png image, such as one taken
 * from a html file input element, return a promise which resolves to the file
 * data as a data url.
 * More info:
 *   https://developer.mozilla.org/en-US/docs/Web/API/File
 *   https://developer.mozilla.org/en-US/docs/Web/API/FileReader
 *   https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
 *
 * Example Usage:
 *   const file = document.querySelector('input[type="file"]').files[0];
 *   console.log(fileToDataUrl(file));
 * @param {File} file The file to be read.
 * @return {Promise<string>} Promise which resolves to the file as a data url.
 */
export const fileToDataUrl = (file: File) => {
  const validFileTypes = ["image/jpeg", "image/png", "image/jpg"];
  const valid = validFileTypes.find((type) => type === file.type);
  // Bad data, let's walk away.
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (!valid) {
    throw Error("provided file is not a png, jpg or jpeg image.");
  }

  const reader = new FileReader();
  const dataUrlPromise = new Promise((resolve, reject) => {
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result);
  });
  reader.readAsDataURL(file);
  return dataUrlPromise;
};

/**
 * SSR only function used to check if they have admin access to this route
 * @param token
 * @param email
 * @returns
 */
export const adminRouteAccess = async (token: string | null, email: string): Promise<boolean> => {
  const [res, err] = await getUserDetails(token, email ?? "", "ssr");
  console.log(res);
  console.log(res?.userDetails.role !== 0);
  return res !== null && res.userDetails !== null && res.userDetails.role === 0;
};
