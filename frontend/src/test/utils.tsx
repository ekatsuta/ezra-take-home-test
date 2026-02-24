import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';

// Mock localStorage
export const createLocalStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
};

// Custom render with providers
export const renderWithAuth = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, {
    wrapper: ({ children }) => (
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    ),
    ...options,
  });
};

// Mock API responses
export const mockApiResponse = (data: unknown, ok = true) => ({
  ok,
  json: async () => data,
});

export const mockUserResponse = {
  user: {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    createdAt: '2024-01-01T00:00:00Z',
  },
  accessToken: 'mock-token',
  tokenType: 'bearer',
};
