/**
 * Checks if the body contains all the fields specified in `fields`
 * @param body request body
 * @param fields fields to check
 * @returns true if body contains all fields specified in `fields`
 */
export const isValidBody = <T extends Record<string, unknown>>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body: any,
    fields: Array<keyof T>,
): body is T => {
    if (fields.length !== 0 && Object.keys(body).length === 0) return false;
    return fields.every((key) => Object.keys(body).includes(key as string));
};

/**
 * Gets the missing `fields` in the `body` as a string delimited by ", "
 * @param body request body
 * @param fields fields to check
 * @returns string with fields delimited by ", "
 */
export const getMissingBodyIDs = <T extends Record<string, unknown>>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body: any,
    fields: Array<keyof T>,
): string => {
    return fields.filter((key) => !Object.keys(body).includes(key as string)).join(", ");
};


export type UserInfo = {
    email: string;
    first_name: string;
    last_name: string;
    role: number; // 0=instructor, 1=student
    enrolments: Array<string>;
    created_courses: Array<string>;
    avatar?: string;
}

export type Nullable<T> = { [K in keyof T]: T[K] | null };
