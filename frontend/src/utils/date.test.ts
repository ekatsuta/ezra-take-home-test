import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatDate,
  formatDateForInput,
  getTodayDate,
  convertDateToISO,
} from './date';

describe('date utils', () => {
  describe('formatDate', () => {
    it('should format date string', () => {
      const result = formatDate('2026-02-23T10:00:00Z');
      expect(result).toBe('2/23/2026');
    });

    it('should return null for null input', () => {
      const result = formatDate(null);
      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const result = formatDate('');
      expect(result).toBeNull();
    });
  });

  describe('formatDateForInput', () => {
    it('should format date string to YYYY-MM-DD format', () => {
      const result = formatDateForInput('2026-02-23T10:00:00Z');
      expect(result).toBe('2026-02-23');
    });

    it('should return empty string for null input', () => {
      const result = formatDateForInput(null);
      expect(result).toBe('');
    });

    it('should return empty string for empty string input', () => {
      const result = formatDateForInput('');
      expect(result).toBe('');
    });
  });

  describe('getTodayDate', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return today date in YYYY-MM-DD format', () => {
      const mockDate = new Date('2026-02-23T15:30:00Z');
      vi.setSystemTime(mockDate);

      const result = getTodayDate();
      expect(result).toBe('2026-02-23');
    });
  });

  describe('convertDateToISO', () => {
    it('should convert YYYY-MM-DD to ISO datetime format', () => {
      const result = convertDateToISO('2026-02-23');
      expect(result).toBe('2026-02-23T00:00:00');
    });

    it('should return undefined for undefined input', () => {
      const result = convertDateToISO(undefined);
      expect(result).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      const result = convertDateToISO('');
      expect(result).toBeUndefined();
    });
  });
});
