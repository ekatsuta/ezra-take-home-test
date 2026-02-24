import { describe, it, expect } from 'vitest';
import { parseApiError } from './apiErrors';

describe('apiErrors utils', () => {
  describe('parseApiError', () => {
    it('should parse array of error messages and join with comma', async () => {
      const mockResponse = {
        status: 422,
        json: async () => ({
          detail: ['Error 1', 'Error 2', 'Error 3'],
        }),
      } as Response;

      const result = await parseApiError(mockResponse);
      expect(result).toBe('Error 1, Error 2, Error 3');
    });

    it('should parse single string error message', async () => {
      const mockResponse = {
        status: 400,
        json: async () => ({
          detail: 'Invalid request',
        }),
      } as Response;

      const result = await parseApiError(mockResponse);
      expect(result).toBe('Invalid request');
    });

    it('should handle response without detail field', async () => {
      const mockResponse = {
        status: 500,
        json: async () => ({}),
      } as Response;

      const result = await parseApiError(mockResponse);
      expect(result).toBe('HTTP error! status: 500');
    });

    it('should handle JSON parse failure', async () => {
      const mockResponse = {
        status: 503,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as unknown as Response;

      const result = await parseApiError(mockResponse);
      expect(result).toBe('HTTP error! status: 503');
    });

    it('should handle empty array of errors', async () => {
      const mockResponse = {
        status: 422,
        json: async () => ({
          detail: [],
        }),
      } as Response;

      const result = await parseApiError(mockResponse);
      expect(result).toBe('');
    });

    it('should handle validation error with single item in array', async () => {
      const mockResponse = {
        status: 422,
        json: async () => ({
          detail: ['Single error message'],
        }),
      } as Response;

      const result = await parseApiError(mockResponse);
      expect(result).toBe('Single error message');
    });
  });
});
