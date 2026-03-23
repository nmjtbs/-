export class ApiRequestError extends Error {
  code: string;
  requestId: string;
  details?: string[];

  constructor({
    code,
    message,
    requestId,
    details,
  }: {
    code: string;
    message: string;
    requestId: string;
    details?: string[];
  }) {
    super(message);
    this.name = "ApiRequestError";
    this.code = code;
    this.requestId = requestId;
    this.details = details;
  }
}
