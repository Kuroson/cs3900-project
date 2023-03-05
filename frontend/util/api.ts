import { HttpException } from "./HttpExceptions";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const examplePost = async (
  url: string,
  token: string,
  payload: any,
): Promise<[any | null, null | Error | any]> => {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...payload }),
    });
    if (!res.ok) {
      const status = res.status;
      const data = await res.json();
      return [null, new HttpException(status, data.message)];
    }
    const data = await res.json();
    return [data, null];
  } catch (err) {
    console.error("Error with posting to example");
    console.error(err);
    return [null, err];
  }
};

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080";
