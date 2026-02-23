import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock fetch globally for all tests
globalThis.fetch = vi.fn();
