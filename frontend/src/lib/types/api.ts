export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  errors?: Record<string, string[]>;
  timestamp: string;
  path: string;
}
