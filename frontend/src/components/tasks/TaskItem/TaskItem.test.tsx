import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TaskItem from './TaskItem';
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
});
