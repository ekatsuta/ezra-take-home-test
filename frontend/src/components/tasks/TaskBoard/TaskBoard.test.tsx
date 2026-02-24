import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskBoard from './TaskBoard';
import { Task } from '../../../types';
import { TASK_STATUS } from '../../../constants';

const mockTasks: Task[] = [
  {
    id: 1,
    title: 'Pending Task',
    description: 'Description 1',
    status: TASK_STATUS.PENDING,
    created_by: 1,
    created_at: '2026-02-23T10:00:00Z',
    updated_at: '2026-02-23T10:00:00Z',
    due_by: '2026-12-31T00:00:00',
    deleted_at: null,
  },
  {
    id: 2,
    title: 'Completed Task',
    description: 'Description 2',
    status: TASK_STATUS.COMPLETED,
    created_by: 1,
    created_at: '2026-02-22T10:00:00Z',
    updated_at: '2026-02-22T10:00:00Z',
    due_by: null,
    deleted_at: null,
  },
];

// Mock the API
vi.mock('../../../services/api', () => ({
  api: {
    getTasks: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
  },
}));

import { api } from '../../../services/api';

// Helper function to match text that may be split across multiple elements
const getByTextContent = (text: string) => {
  return screen.getByText((_content, element) => {
    return element?.textContent === text;
  });
};

describe('TaskBoard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.setSystemTime(new Date('2026-01-01'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should fetch and display tasks on mount', async () => {
    (api.getTasks as ReturnType<typeof vi.fn>).mockResolvedValue(mockTasks);

    render(<TaskBoard />);

    // Should show loading initially
    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText('Pending Task')).toBeInTheDocument();
      expect(screen.getByText('Completed Task')).toBeInTheDocument();
    });

    expect(api.getTasks).toHaveBeenCalledTimes(1);
  });

  it('should display task statistics', async () => {
    (api.getTasks as ReturnType<typeof vi.fn>).mockResolvedValue(mockTasks);

    render(<TaskBoard />);

    await waitFor(() => {
      expect(getByTextContent('Total: 2')).toBeInTheDocument();
      expect(getByTextContent('Pending: 1')).toBeInTheDocument();
      expect(getByTextContent('Completed: 1')).toBeInTheDocument();
    });
  });

  it('should display empty state when no tasks', async () => {
    (api.getTasks as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    render(<TaskBoard />);

    await waitFor(() => {
      expect(
        screen.getByText('No tasks yet. Create one to get started!')
      ).toBeInTheDocument();
    });
  });

  it('should display error message on fetch failure', async () => {
    (api.getTasks as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Failed to fetch tasks')
    );

    render(<TaskBoard />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch tasks')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /retry/i })
      ).toBeInTheDocument();
    });
  });

  it('should retry fetching tasks when Retry button is clicked', async () => {
    const user = userEvent.setup();
    (api.getTasks as ReturnType<typeof vi.fn>)
      .mockRejectedValueOnce(new Error('Failed to fetch tasks'))
      .mockResolvedValueOnce(mockTasks);

    render(<TaskBoard />);

    // Wait for error
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch tasks')).toBeInTheDocument();
    });

    // Click retry
    await user.click(screen.getByRole('button', { name: /retry/i }));

    // Should fetch tasks successfully
    await waitFor(() => {
      expect(screen.getByText('Pending Task')).toBeInTheDocument();
    });

    expect(api.getTasks).toHaveBeenCalledTimes(2);
  });

  it('should create a new task', async () => {
    const user = userEvent.setup();
    const newTask: Task = {
      id: 3,
      title: 'New Task',
      description: 'New Description',
      status: TASK_STATUS.PENDING,
      created_by: 1,
      created_at: '2026-02-24T10:00:00Z',
      updated_at: '2026-02-24T10:00:00Z',
      due_by: '2026-06-15T00:00:00',
      deleted_at: null,
    };

    (api.getTasks as ReturnType<typeof vi.fn>).mockResolvedValue(mockTasks);
    (api.createTask as ReturnType<typeof vi.fn>).mockResolvedValue(newTask);

    render(<TaskBoard />);

    await waitFor(() => {
      expect(screen.getByText('Pending Task')).toBeInTheDocument();
    });

    // Fill in task form
    const titleInput = screen.getByPlaceholderText('Task title');
    const descriptionInput = screen.getByPlaceholderText(
      'Description (optional)'
    );
    const dueDateInput = screen.getByLabelText('Due Date (optional)');

    await user.type(titleInput, 'New Task');
    await user.type(descriptionInput, 'New Description');
    fireEvent.change(dueDateInput, { target: { value: '2026-06-15' } });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /add task/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(api.createTask).toHaveBeenCalledWith({
        title: 'New Task',
        description: 'New Description',
        due_by: '2026-06-15',
      });
    });

    await waitFor(() => {
      expect(screen.getByText('New Task')).toBeInTheDocument();
    });
  });

  it('should filter tasks by status', async () => {
    const user = userEvent.setup();
    (api.getTasks as ReturnType<typeof vi.fn>).mockResolvedValue(mockTasks);

    render(<TaskBoard />);

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText('Pending Task')).toBeInTheDocument();
      expect(screen.getByText('Completed Task')).toBeInTheDocument();
    });

    // Click Pending filter
    await user.click(screen.getByRole('button', { name: 'Pending' }));

    await waitFor(() => {
      expect(screen.getByText('Pending Task')).toBeInTheDocument();
      expect(screen.queryByText('Completed Task')).not.toBeInTheDocument();
    });

    // Click Completed filter
    await user.click(screen.getByRole('button', { name: 'Completed' }));

    await waitFor(() => {
      expect(screen.queryByText('Pending Task')).not.toBeInTheDocument();
      expect(screen.getByText('Completed Task')).toBeInTheDocument();
    });

    // Click All filter
    await user.click(screen.getByRole('button', { name: 'All' }));

    await waitFor(() => {
      expect(screen.getByText('Pending Task')).toBeInTheDocument();
      expect(screen.getByText('Completed Task')).toBeInTheDocument();
    });
  });

  it('should toggle task status', async () => {
    const user = userEvent.setup();
    const updatedTask: Task = {
      ...mockTasks[0],
      status: TASK_STATUS.COMPLETED,
    };

    (api.getTasks as ReturnType<typeof vi.fn>).mockResolvedValue(mockTasks);
    (api.updateTask as ReturnType<typeof vi.fn>).mockResolvedValue(updatedTask);

    render(<TaskBoard />);

    await waitFor(() => {
      expect(screen.getByText('Pending Task')).toBeInTheDocument();
    });

    // Click checkbox to toggle status
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);

    await waitFor(() => {
      expect(api.updateTask).toHaveBeenCalledWith(1, {
        status: TASK_STATUS.COMPLETED,
      });
    });
  });

  it('should delete task', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    (api.getTasks as ReturnType<typeof vi.fn>).mockResolvedValue(mockTasks);
    (api.deleteTask as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    render(<TaskBoard />);

    await waitFor(() => {
      expect(screen.getByText('Pending Task')).toBeInTheDocument();
    });

    // Click delete button
    const deleteButtons = screen.getAllByRole('button', {
      name: /delete task/i,
    });
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalled();
      expect(api.deleteTask).toHaveBeenCalledWith(1);
      expect(screen.queryByText('Pending Task')).not.toBeInTheDocument();
    });

    confirmSpy.mockRestore();
  });

  it('should update statistics when tasks change', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    (api.getTasks as ReturnType<typeof vi.fn>).mockResolvedValue(mockTasks);
    (api.deleteTask as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    render(<TaskBoard />);

    await waitFor(() => {
      expect(screen.getByText('Pending Task')).toBeInTheDocument();
    });

    // Verify initial stats: 2 total, 1 pending, 1 completed
    expect(getByTextContent('Total: 2')).toBeInTheDocument();
    expect(getByTextContent('Pending: 1')).toBeInTheDocument();
    expect(getByTextContent('Completed: 1')).toBeInTheDocument();

    // Delete the pending task
    const deleteButtons = screen.getAllByRole('button', {
      name: /delete task/i,
    });
    await user.click(deleteButtons[0]);

    // Verify updated stats: 1 total, 0 pending, 1 completed
    await waitFor(() => {
      expect(screen.queryByText('Pending Task')).not.toBeInTheDocument();
      expect(getByTextContent('Total: 1')).toBeInTheDocument();
      expect(getByTextContent('Pending: 0')).toBeInTheDocument();
      expect(getByTextContent('Completed: 1')).toBeInTheDocument();
    });

    confirmSpy.mockRestore();
  });
});
