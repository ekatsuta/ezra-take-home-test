import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatDate,
  formatDateForInput,
  getTodayDate,
  convertDateToISO,
} from './date';

describe('date utils', () => {
  describe('formatDate', () => {
    it('should format date string to en-US localized date by default', () => {
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

    it('should handle different date formats', () => {
      const result = formatDate('2026-12-31T23:59:59Z');
      expect(result).toBe('12/31/2026');
    });

    it('should support custom locale', () => {
      const result = formatDate('2026-02-23T10:00:00Z', 'en-GB');
      expect(result).toBe('23/02/2026');
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

    it('should handle dates at end of year', () => {
      const result = formatDateForInput('2026-12-31T23:59:59Z');
      expect(result).toBe('2026-12-31');
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

    it('should return consistent format across different times of day', () => {
      const mockDate = new Date('2026-12-31T23:59:59Z');
      vi.setSystemTime(mockDate);

      const result = getTodayDate();
      expect(result).toBe('2026-12-31');
    });

    it('should match YYYY-MM-DD pattern', () => {
      const mockDate = new Date('2026-02-23T15:30:00Z');
      vi.setSystemTime(mockDate);

      const result = getTodayDate();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
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

    it('should handle different date formats consistently', () => {
      const result = convertDateToISO('2026-12-31');
      expect(result).toBe('2026-12-31T00:00:00');
    });

    it('should always append T00:00:00 to the date', () => {
      const result = convertDateToISO('2026-01-01');
      expect(result).toContain('T00:00:00');
    });
  });
});
