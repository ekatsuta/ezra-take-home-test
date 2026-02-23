import { useState, FormEvent } from 'react';
import { Task, TaskUpdate } from '../../../types';
import { formatDateForInput, getTodayDate } from '../../../utils/date';
import styles from './TaskEditForm.module.css';

interface TaskEditFormProps {
  task: Task;
  loading: boolean;
  onSave: (updates: TaskUpdate) => Promise<void>;
  onCancel: () => void;
}

export default function TaskEditForm({
  task,
  loading,
  onSave,
  onCancel,
}: TaskEditFormProps) {
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(
    task.description || ''
  );
  const [editDueBy, setEditDueBy] = useState(formatDateForInput(task.due_by));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSave({
      title: editTitle,
      description: editDescription || undefined,
      due_by: editDueBy || undefined,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`${styles.form} ${styles.editMode}`}
    >
      <div className={styles.formContent}>
        <input
          type="text"
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          required
          disabled={loading}
          className={styles.input}
          placeholder="Task title"
        />
        <textarea
          value={editDescription}
          onChange={e => setEditDescription(e.target.value)}
          disabled={loading}
          className={styles.textarea}
          placeholder="Description (optional)"
          rows={2}
        />
        <label htmlFor={`editDueBy-${task.id}`} className={styles.label}>
          Due Date (optional)
        </label>
        <input
          id={`editDueBy-${task.id}`}
          type="date"
          value={editDueBy}
          onChange={e => setEditDueBy(e.target.value)}
          disabled={loading}
          className={styles.dateInput}
          min={getTodayDate()}
        />
      </div>
      <div className={styles.formActions}>
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
          onClick={onCancel}
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
