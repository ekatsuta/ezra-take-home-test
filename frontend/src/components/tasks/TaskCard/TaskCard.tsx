import { useState } from 'react';
import { Task, TaskUpdate } from '../../../types';
import { TASK_STATUS, TaskStatus } from '../../../constants/taskStatus';
import TaskItem from '../TaskItem/TaskItem';
import TaskEditForm from '../TaskEditForm/TaskEditForm';

interface TaskCardProps {
  task: Task;
  onToggleStatus: (id: number, status: TaskStatus) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onUpdate: (id: number, updates: TaskUpdate) => Promise<void>;
}

export default function TaskCard({
  task,
  onToggleStatus,
  onDelete,
  onUpdate,
}: TaskCardProps) {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const newStatus =
        task.status === TASK_STATUS.PENDING
          ? TASK_STATUS.COMPLETED
          : TASK_STATUS.PENDING;
      await onToggleStatus(task.id, newStatus);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }
    setLoading(true);
    try {
      await onDelete(task.id);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async (updates: TaskUpdate) => {
    setLoading(true);
    try {
      await onUpdate(task.id, updates);
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <TaskEditForm
        task={task}
        loading={loading}
        onSave={handleSaveEdit}
        onCancel={handleCancelEdit}
      />
    );
  }

  return (
    <TaskItem
      task={task}
      loading={loading}
      onToggleStatus={handleToggle}
      onEdit={() => setIsEditing(true)}
      onDelete={handleDelete}
    />
  );
}
