import { HttpException } from "../HttpExceptions";

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

export const apiPut = async <T extends Record<string, unknown>, U extends Record<string, unknown>>(
  url: string,
  token: string | null,
  payload: T,
): Promise<[U | null, null | Error | any]> => {
  try {
    const res = await fetch(url, {
      method: "PUT",
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

export const apiDelete = async <
  T extends Record<string, unknown>,
  U extends Record<string, unknown>,
>(
  url: string,
  token: string | null,
  payload: T,
): Promise<[U | null, null | Error | any]> => {
  try {
    const res = await fetch(url, {
      method: "DELETE",
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
      if (Object.keys(queryParams).length === 0) return url;
      const urlParams = new URLSearchParams({ ...queryParams });
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
    for (const key of Object.keys(queryParams)) {
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

// Link used for frontend client
export const CLIENT_BACKEND_URL =
  process.env.NEXT_PUBLIC_DOCKER !== undefined
    ? "http://localhost:8080"
    : process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080";

// Link used for NextJS SSR
export const SSR_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080";

export type BackendLinkType = "client" | "ssr";
