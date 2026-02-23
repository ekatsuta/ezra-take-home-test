import { useState, FormEvent } from 'react';
import { Task, TaskUpdate } from '../types';
import { formatDate, formatDateForInput } from '../utils/date';
import styles from './TaskItem.module.css';

interface TaskItemProps {
  task: Task;
  onToggleStatus: (
    id: number,
    status: 'pending' | 'completed'
  ) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onUpdate: (id: number, updates: TaskUpdate) => Promise<void>;
}

export default function TaskItem({
  task,
  onToggleStatus,
  onDelete,
  onUpdate,
}: TaskItemProps) {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(
    task.description || ''
  );
  const [editDueBy, setEditDueBy] = useState(formatDateForInput(task.due_by));

  const handleToggle = async () => {
    setLoading(true);
    try {
      const newStatus = task.status === 'pending' ? 'completed' : 'pending';
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

  const handleSaveEdit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onUpdate(task.id, {
        title: editTitle,
        description: editDescription || undefined,
        due_by: editDueBy || undefined,
      });
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditDueBy(formatDateForInput(task.due_by));
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <form
        onSubmit={handleSaveEdit}
        className={`${styles.taskItem} ${styles.editMode}`}
      >
        <div className={styles.taskContent}>
          <input
            type="text"
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            required
            disabled={loading}
            className={styles.editInput}
            placeholder="Task title"
          />
          <textarea
            value={editDescription}
            onChange={e => setEditDescription(e.target.value)}
            disabled={loading}
            className={styles.editTextarea}
            placeholder="Description (optional)"
            rows={2}
          />
          <input
            type="date"
            value={editDueBy}
            onChange={e => setEditDueBy(e.target.value)}
            disabled={loading}
            className={styles.editDateInput}
          />
        </div>
        <div className={styles.taskActions}>
          <button
            type="submit"
            disabled={loading}
            className={styles.saveButton}
            aria-label="Save changes"
          >
            Save
          </button>
          <button
            type="button"
            onClick={handleCancelEdit}
            disabled={loading}
            className={styles.cancelButton}
            aria-label="Cancel editing"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div
      className={`${styles.taskItem} ${
        task.status === 'completed' ? styles.completed : ''
      }`}
    >
      <div className={styles.taskContent}>
        <div className={styles.taskHeader}>
          <input
            type="checkbox"
            checked={task.status === 'completed'}
            onChange={handleToggle}
            disabled={loading}
            className={styles.checkbox}
          />
          <h3 className={styles.title}>{task.title}</h3>
        </div>
        {task.description && (
          <p className={styles.description}>{task.description}</p>
        )}
        <div className={styles.taskMeta}>
          {task.due_by && (
            <span className={styles.dueDate}>
              Due: {formatDate(task.due_by)}
            </span>
          )}
          <span className={styles.createdDate}>
            Created: {formatDate(task.created_at)}
          </span>
        </div>
      </div>
      <div className={styles.taskActions}>
        <button
          onClick={() => setIsEditing(true)}
          disabled={loading}
          className={styles.editButton}
          aria-label="Edit task"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className={styles.deleteButton}
          aria-label="Delete task"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
