/**
 * Utility functions for consistent error handling
 */

/**
 * Safely extract an error message from an unknown error type
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  
  return 'Unknown error occurred';
};

/**
 * Generate a standard error response object
 */
export const createErrorResponse = (
  error: unknown, 
  defaultMessage: string = 'An error occurred',
  includeDetails: boolean = process.env.NODE_ENV === 'development'
) => {
  return {
    status: 'error',
    message: defaultMessage,
    error: includeDetails ? getErrorMessage(error) : undefined,
  };
}; 