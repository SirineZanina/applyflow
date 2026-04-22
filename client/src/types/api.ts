export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  code: string;
  message: string;
  validationErrors?: ValidationError[];
}

export class HttpError extends Error {
  readonly status: number;
  readonly apiError: ApiError;

  constructor(status: number, apiError: ApiError) {
    super(apiError.message);
    this.name = "HttpError";
    this.status = status;
    this.apiError = apiError;
  }
}
