/**
 * Checks if `email` is a valid email.
 * @param email
 * @returns
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = new RegExp(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{1,}))$/,
  );
  return emailRegex.test(email);
};

/**
 * Checks if `password` is a valid password given the requirements:
 * - At least 8 characters
 * - At least 1 number
 * - At least 1 special character of the following: !@#$%^&*()~-
 * @param password
 * @returns
 */
export const isValidPassword = (password: string): boolean => {
  const passwordRegex = new RegExp(
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&^()~-])[A-Za-z\d@$!%*#?&^()~-]{8,}$/,
  );
  return passwordRegex.test(password);
};
