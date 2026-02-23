/**
 * Parse error response from API and return user-friendly message
 */
export const parseApiError = async (response: Response): Promise<string> => {
  const errorData = await response.json().catch(() => null);

  if (errorData?.detail) {
    // Handle validation errors (array format) or simple errors (string format)
    if (Array.isArray(errorData.detail)) {
      return errorData.detail.join(', ');
    }
    return errorData.detail;
  }

  return `HTTP error! status: ${response.status}`;
};
