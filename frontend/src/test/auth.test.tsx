import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import {
  renderWithAuth,
  mockApiResponse,
  mockUserResponse,
  createLocalStorageMock,
} from './utils';

const mockFetch = globalThis.fetch as ReturnType<typeof vi.fn>;
const localStorageMock = createLocalStorageMock();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Auth Flow', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    localStorageMock.clear();
  });

  describe('Registration', () => {
    it('should register a new user successfully', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce(mockApiResponse(mockUserResponse));
      const onSuccess = vi.fn();

      renderWithAuth(<RegisterForm onSuccess={onSuccess} />);

      await user.type(screen.getByLabelText(/name/i), 'Test User');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /register/i }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/v1/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            name: 'Test User',
            password: 'password123',
          }),
        });
        expect(onSuccess).toHaveBeenCalled();
        expect(localStorageMock.getItem('token')).toBe('mock-token');
      });
    });

    it('should show error on registration failure', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce(
        mockApiResponse({ detail: 'Email already registered' }, false)
      );

      renderWithAuth(<RegisterForm />);

      await user.type(screen.getByLabelText(/name/i), 'Test User');
      await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /register/i }));

      await waitFor(() => {
        expect(
          screen.getByText(/email already registered/i)
        ).toBeInTheDocument();
      });
    });

    it('should enforce minimum password length', () => {
      renderWithAuth(<RegisterForm />);
      expect(screen.getByLabelText(/password/i)).toHaveAttribute(
        'minLength',
        '8'
      );
    });
  });

  describe('Login', () => {
    it('should login user successfully', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce(mockApiResponse(mockUserResponse));
      const onSuccess = vi.fn();

      renderWithAuth(<LoginForm onSuccess={onSuccess} />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /login/i }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
          }),
        });
        expect(onSuccess).toHaveBeenCalled();
        expect(localStorageMock.getItem('token')).toBe('mock-token');
      });
    });

    it('should show error on invalid credentials', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce(
        mockApiResponse({ detail: 'Incorrect email or password' }, false)
      );

      renderWithAuth(<LoginForm />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /login/i }));

      await waitFor(() => {
        expect(
          screen.getByText(/incorrect email or password/i)
        ).toBeInTheDocument();
      });
    });

    it('should disable form during submission', async () => {
      const user = userEvent.setup();
      mockFetch.mockImplementationOnce(
        () =>
          new Promise(resolve =>
            setTimeout(() => resolve(mockApiResponse(mockUserResponse)), 100)
          )
      );

      renderWithAuth(<LoginForm />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /login/i }));

      expect(
        screen.getByRole('button', { name: /logging in/i })
      ).toBeDisabled();
    });
  });
});
