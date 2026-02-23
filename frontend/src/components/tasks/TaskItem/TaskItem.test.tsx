import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskItem from './TaskItem';
import { Task } from '../../../types';
import { TASK_STATUS } from '../../../constants/taskStatus';

const mockTask: Task = {
  id: 1,
  title: 'Test Task',
  description: 'Test Description',
  status: TASK_STATUS.PENDING,
  created_by: 1,
  created_at: '2024-02-23T10:00:00Z',
  updated_at: '2024-02-23T10:00:00Z',
  due_by: '2024-12-31T00:00:00',
  deleted_at: null,
};

describe('TaskItem', () => {
  it('should render task information', () => {
    const onToggleStatus = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <TaskItem
        task={mockTask}
        loading={false}
        onToggleStatus={onToggleStatus}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText(/Due:/)).toBeInTheDocument();
    expect(screen.getByText(/Created:/)).toBeInTheDocument();
  });

  it('should not render description if null', () => {
    const taskWithoutDescription: Task = {
      ...mockTask,
      description: null,
    };

    render(
      <TaskItem
        task={taskWithoutDescription}
        loading={false}
        onToggleStatus={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
  });

  it('should not render due date if null', () => {
    const taskWithoutDueDate: Task = {
      ...mockTask,
      due_by: null,
    };

    render(
      <TaskItem
        task={taskWithoutDueDate}
        loading={false}
        onToggleStatus={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.queryByText(/Due:/)).not.toBeInTheDocument();
  });

  it('should show checkbox as checked for completed task', () => {
    const completedTask: Task = {
      ...mockTask,
      status: TASK_STATUS.COMPLETED,
    };

    render(
      <TaskItem
        task={completedTask}
        loading={false}
        onToggleStatus={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('should show checkbox as unchecked for pending task', () => {
    render(
      <TaskItem
        task={mockTask}
        loading={false}
        onToggleStatus={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('should call onToggleStatus when checkbox is clicked', async () => {
    const user = userEvent.setup();
    const onToggleStatus = vi.fn();

    render(
      <TaskItem
        task={mockTask}
        loading={false}
        onToggleStatus={onToggleStatus}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(onToggleStatus).toHaveBeenCalledTimes(1);
  });

  it('should call onEdit when Edit button is clicked', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();

    render(
      <TaskItem
        task={mockTask}
        loading={false}
        onToggleStatus={vi.fn()}
        onEdit={onEdit}
        onDelete={vi.fn()}
      />
    );

    const editButton = screen.getByRole('button', { name: /edit task/i });
    await user.click(editButton);

    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('should call onDelete when Delete button is clicked', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(
      <TaskItem
        task={mockTask}
        loading={false}
        onToggleStatus={vi.fn()}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete task/i });
    await user.click(deleteButton);

    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('should disable all buttons when loading', () => {
    render(
      <TaskItem
        task={mockTask}
        loading={true}
        onToggleStatus={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    const editButton = screen.getByRole('button', { name: /edit task/i });
    const deleteButton = screen.getByRole('button', { name: /delete task/i });

    expect(checkbox).toBeDisabled();
    expect(editButton).toBeDisabled();
    expect(deleteButton).toBeDisabled();
  });

  it('should apply completed styles to completed task', () => {
    const completedTask: Task = {
      ...mockTask,
      status: TASK_STATUS.COMPLETED,
    };

    const { container } = render(
      <TaskItem
        task={completedTask}
        loading={false}
        onToggleStatus={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const taskElement = container.firstChild as HTMLElement;
    expect(taskElement.className).toContain('completed');
  });

  it('should not apply completed styles to pending task', () => {
    const { container } = render(
      <TaskItem
        task={mockTask}
        loading={false}
        onToggleStatus={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const taskElement = container.firstChild as HTMLElement;
    expect(taskElement.className).not.toContain('completed');
  });
});
