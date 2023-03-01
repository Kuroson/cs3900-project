/* eslint-disable @typescript-eslint/no-explicit-any */
export class HttpException extends Error {
  public status: number;
  public message: string;
  public err: any | undefined;

  constructor(status: number, message: string, err: any = undefined) {
    super(message);
    this.status = status;
    this.message = message;
    this.err = err;
  }
}
