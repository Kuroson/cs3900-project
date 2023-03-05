/* eslint-disable @typescript-eslint/no-explicit-any */
export class HttpException extends Error {
  public status: number;
  public message: string;
  public originalError: any | undefined;

  constructor(status: number, message: string, originalError: any = undefined) {
    super(message);
    this.status = status;
    this.message = message;
    this.originalError = originalError;
  }

  public getStatusCode(): number {
    return this.status;
  }

  public getMessage(): string {
    return this.message;
  }
}
