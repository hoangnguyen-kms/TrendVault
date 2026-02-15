export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export interface ErrorResponse {
  success: false;
  error: string;
  details?: Array<{ field: string; message: string }>;
}

export function successResponse<T>(data: T): SuccessResponse<T> {
  return {
    success: true,
    data,
  };
}

export function errorResponse(
  error: string,
  details?: Array<{ field: string; message: string }>
): ErrorResponse {
  return {
    success: false,
    error,
    ...(details && { details }),
  };
}
