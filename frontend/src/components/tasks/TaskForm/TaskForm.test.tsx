import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskForm from './TaskForm';

describe('TaskForm', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2026-01-01'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });
  it('should render all form fields', () => {
    const onSubmit = vi.fn();
    render(<TaskForm onSubmit={onSubmit} />);

    expect(screen.getByPlaceholderText('Task title')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Description (optional)')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Due Date (optional)')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /add task/i })
    ).toBeInTheDocument();
  });

  it('should submit form with title only', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<TaskForm onSubmit={onSubmit} />);

    const titleInput = screen.getByPlaceholderText('Task title');
    await user.type(titleInput, 'New Task');

    const submitButton = screen.getByRole('button', { name: /add task/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'New Task',
        description: undefined,
        due_by: undefined,
      });
    });
  });

  it('should submit form with all fields filled', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<TaskForm onSubmit={onSubmit} />);

    const titleInput = screen.getByPlaceholderText('Task title');
    const descriptionInput = screen.getByPlaceholderText(
      'Description (optional)'
    );
    const dueDateInput = screen.getByLabelText('Due Date (optional)');

    await user.type(titleInput, 'Complete Task');
    await user.type(descriptionInput, 'Task description here');
    fireEvent.change(dueDateInput, { target: { value: '2026-06-15' } });

    const submitButton = screen.getByRole('button', { name: /add task/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'Complete Task',
        description: 'Task description here',
        due_by: '2026-06-15',
      });
    });
  });

  it('should clear form after successful submission', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<TaskForm onSubmit={onSubmit} />);

    const titleInput = screen.getByPlaceholderText('Task title');
    const descriptionInput = screen.getByPlaceholderText(
      'Description (optional)'
    );
    const dueDateInput = screen.getByLabelText('Due Date (optional)');

    await user.type(titleInput, 'Test Task');
    await user.type(descriptionInput, 'Test Description');
    fireEvent.change(dueDateInput, { target: { value: '2026-06-15' } });

    await user.click(screen.getByRole('button', { name: /add task/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
      expect(titleInput).toHaveValue('');
      expect(descriptionInput).toHaveValue('');
      expect(dueDateInput).toHaveValue('');
    });
  });

  it('should display error message on submission failure', async () => {
    const user = userEvent.setup();
    const onSubmit = vi
      .fn()
      .mockRejectedValue(new Error('Failed to create task'));

    render(<TaskForm onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText('Task title'), 'Test Task');
    await user.click(screen.getByRole('button', { name: /add task/i }));

    await waitFor(() => {
      expect(screen.getByText('Failed to create task')).toBeInTheDocument();
    });
  });

  it('should disable submit button while loading', async () => {
    const user = userEvent.setup();
    let resolveSubmit: () => void;
    const onSubmit = vi.fn(
      () =>
        new Promise<void>(resolve => {
          resolveSubmit = resolve;
        })
    );

    render(<TaskForm onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText('Task title'), 'Test Task');

    const submitButton = screen.getByRole('button', { name: /add task/i });
    await user.click(submitButton);

    // Button should be disabled while loading
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(screen.getByText('Creating...')).toBeInTheDocument();
    });

    // Resolve the promise
    resolveSubmit!();

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
      expect(screen.getByText('Add Task')).toBeInTheDocument();
    });
  });

  it('should require title field', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<TaskForm onSubmit={onSubmit} />);

    const titleInput = screen.getByPlaceholderText('Task title');
    expect(titleInput).toBeRequired();

    // Try to submit without title
    await user.click(screen.getByRole('button', { name: /add task/i }));

    // Form should not submit
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
