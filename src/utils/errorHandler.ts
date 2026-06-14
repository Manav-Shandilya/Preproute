import axios from 'axios';

export interface AppError {
  type: 'network' | 'auth' | 'client' | 'server' | 'unknown';
  message: string;
  statusCode?: number;
  retryable: boolean;
}

export function parseApiError(error: unknown): AppError {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return {
        type: 'network',
        message: 'Unable to connect to the server. Please check your internet connection.',
        retryable: true,
      };
    }

    const status = error.response.status;
    const serverMessage = error.response.data?.message;

    if (status === 401) {
      return { type: 'auth', message: 'Session expired. Please log in again.', statusCode: 401, retryable: false };
    }

    if (status >= 400 && status < 500) {
      return {
        type: 'client',
        message: serverMessage || 'Invalid request. Please check your input.',
        statusCode: status,
        retryable: false,
      };
    }

    if (status >= 500) {
      return {
        type: 'server',
        message: 'Something went wrong on the server. Please try again.',
        statusCode: status,
        retryable: true,
      };
    }
  }

  return { type: 'unknown', message: 'An unexpected error occurred.', retryable: false };
}
