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

export const apiPost = async <T extends Record<string, unknown>, U extends Record<string, unknown>>(
  url: string,
  token: string | null,
  payload: T,
): Promise<[U | null, null | Error | any]> => {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token ?? "bad"}`,
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
    return [null, err];
  }
};

export const apiGet = async <T extends Record<string, string>, U extends Record<string, unknown>>(
  url: string,
  token: string | null,
  queryParams: T,
): Promise<[U | null, null | Error | any]> => {
  try {
    const generateURL = () => {
      const urlParams = new URLSearchParams({ ...queryParams });
      if (urlParams.entries.length === 0) {
        return url;
      }
      return `${url}?${urlParams.toString()}`;
    };

    const res = await fetch(generateURL(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token ?? "bad"}`,
      },
    });
    if (!res.ok) {
      const status = res.status;
      const data = await res.json();
      return [null, new HttpException(status, data.message)];
    }
    const data = await res.json();
    return [data, null];
  } catch (err) {
    return [null, err];
  }
};

export const apiUploadFile = async <
  T extends Record<string, string>,
  U extends Record<string, unknown>,
>(
  url: string,
  token: string | null,
  file: File,
  queryParams: T,
): Promise<[U | null, null | Error | any]> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    for (let key of Object.keys(queryParams)) {
      formData.append(key, queryParams[key]);
    }

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token ?? "bad"}`,
      },
      body: formData,
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
    return [null, err];
  }
};

export const PROCESS_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080";
