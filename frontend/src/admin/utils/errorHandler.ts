import axios, { AxiosError } from 'axios';

export enum ErrorCode {
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  SERVER_ERROR = 'SERVER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; code?: string }>;
    const status = axiosError.response?.status ?? 0;
    const message = axiosError.response?.data?.message ?? 'An unexpected error occurred';
    const details = axiosError.response?.data;

    if (axiosError.code === 'ECONNABORTED') {
      throw new ApiError(0, ErrorCode.TIMEOUT, 'Request timeout', details);
    }

    switch (status) {
      case 400:
        throw new ApiError(400, ErrorCode.BAD_REQUEST, message, details);
      case 401:
        throw new ApiError(401, ErrorCode.UNAUTHORIZED, 'Please login again', details);
      case 403:
        throw new ApiError(403, ErrorCode.FORBIDDEN, 'Access denied', details);
      case 404:
        throw new ApiError(404, ErrorCode.NOT_FOUND, 'Resource not found', details);
      case 500:
      case 502:
      case 503:
        throw new ApiError(status, ErrorCode.SERVER_ERROR, 'Server error occurred', details);
      default:
        throw new ApiError(status, ErrorCode.NETWORK_ERROR, message, details);
    }
  }

  if (error instanceof Error) {
    throw new ApiError(0, ErrorCode.NETWORK_ERROR, error.message);
  }

  throw new ApiError(0, ErrorCode.NETWORK_ERROR, 'Unknown error');
};
