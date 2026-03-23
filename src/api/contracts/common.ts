export type ApiSource = "mock" | "backend";

export interface ApiMeta {
  requestId: string;
  generatedAt: string;
  version: "v1";
  source: ApiSource;
  stale: boolean;
  warnings: string[];
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta: ApiMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string[];
  };
  meta: ApiMeta;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
