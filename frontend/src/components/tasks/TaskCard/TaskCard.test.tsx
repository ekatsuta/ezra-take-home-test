import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskCard from './TaskCard';
import { Task } from '../../../types';
import { TASK_STATUS } from '../../../constants';

const mockTask: Task = {
  id: 1,
  title: 'Test Task',
  description: 'Test Description',
  status: TASK_STATUS.PENDING,
  created_by: 1,
  created_at: '2026-02-23T10:00:00Z',
  updated_at: '2026-02-23T10:00:00Z',
  due_by: '2026-12-31T00:00:00',
  deleted_at: null,
};

describe('TaskCard', () => {
  const mockOnToggleStatus = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock system time to a fixed date for consistent tests
    vi.setSystemTime(new Date('2026-01-01'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render TaskItem in view mode by default', () => {
    render(
      <TaskCard
        task={mockTask}
        onToggleStatus={mockOnToggleStatus}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /edit task/i })
    ).toBeInTheDocument();
  });

  it('should switch to edit mode when Edit button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <TaskCard
        task={mockTask}
        onToggleStatus={mockOnToggleStatus}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    const editButton = screen.getByRole('button', { name: /edit task/i });
    await user.click(editButton);

    // Should show TaskEditForm
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should switch back to view mode when Cancel button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <TaskCard
        task={mockTask}
        onToggleStatus={mockOnToggleStatus}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    // Enter edit mode
    await user.click(screen.getByRole('button', { name: /edit task/i }));

    // Cancel edit
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    // Should show TaskItem again
    expect(
      screen.getByRole('button', { name: /edit task/i })
    ).toBeInTheDocument();
  });

  it('should toggle task status from pending to completed and handle loading state', async () => {
    const user = userEvent.setup();
    let resolveToggle: () => void;
    mockOnToggleStatus.mockReturnValue(
      new Promise<void>(resolve => {
        resolveToggle = resolve;
      })
    );

    render(
      <TaskCard
        task={mockTask}
        onToggleStatus={mockOnToggleStatus}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    const editButton = screen.getByRole('button', { name: /edit task/i });
    const deleteButton = screen.getByRole('button', { name: /delete task/i });

    await user.click(checkbox);

    // Buttons should be disabled during loading
    await waitFor(() => {
      expect(checkbox).toBeDisabled();
      expect(editButton).toBeDisabled();
      expect(deleteButton).toBeDisabled();
    });

    // Resolve the promise
    resolveToggle!();

    // Buttons should be enabled again and toggle should have been called
    await waitFor(() => {
      expect(checkbox).not.toBeDisabled();
      expect(editButton).not.toBeDisabled();
      expect(deleteButton).not.toBeDisabled();
      expect(mockOnToggleStatus).toHaveBeenCalledWith(1, TASK_STATUS.COMPLETED);
    });
  });

  it('should toggle task status from completed to pending', async () => {
    const user = userEvent.setup();
    const completedTask: Task = { ...mockTask, status: TASK_STATUS.COMPLETED };
    mockOnToggleStatus.mockResolvedValue(undefined);

    render(
      <TaskCard
        task={completedTask}
        onToggleStatus={mockOnToggleStatus}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    await waitFor(() => {
      expect(mockOnToggleStatus).toHaveBeenCalledWith(1, TASK_STATUS.PENDING);
    });
  });

  it('should delete task after confirmation', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    mockOnDelete.mockResolvedValue(undefined);

    render(
      <TaskCard
        task={mockTask}
        onToggleStatus={mockOnToggleStatus}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete task/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalledWith(
        'Are you sure you want to delete this task?'
      );
      expect(mockOnDelete).toHaveBeenCalledWith(1);
    });

    confirmSpy.mockRestore();
  });

  it('should not delete task if confirmation is cancelled', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(
      <TaskCard
        task={mockTask}
        onToggleStatus={mockOnToggleStatus}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete task/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalled();
      expect(mockOnDelete).not.toHaveBeenCalled();
    });

    confirmSpy.mockRestore();
  });

  it('should update task and exit edit mode on save', async () => {
    const user = userEvent.setup();
    mockOnUpdate.mockResolvedValue(undefined);

    render(
      <TaskCard
        task={mockTask}
        onToggleStatus={mockOnToggleStatus}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    );

    // Enter edit mode
    await user.click(screen.getByRole('button', { name: /edit task/i }));

    // Modify title
    const titleInput = screen.getByDisplayValue('Test Task');
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Task');

    // Save
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          title: 'Updated Task',
        })
      );
    });

    // Should exit edit mode
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /edit task/i })
      ).toBeInTheDocument();
    });
  });
});
