import { useState, FormEvent } from 'react';
import { Task, TaskUpdate } from '../../../types';
import { formatDateForInput, getTodayDate } from '../../../utils/date';
import { TextInput, Textarea, DateInput } from '../../forms/shared';
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
        <TextInput
          value={editTitle}
          onChange={setEditTitle}
          placeholder="Task title"
          required
          disabled={loading}
          className={styles.input}
        />
        <Textarea
          value={editDescription}
          onChange={setEditDescription}
          placeholder="Description (optional)"
          disabled={loading}
          className={styles.textarea}
          rows={2}
        />
        <DateInput
          id={`editDueBy-${task.id}`}
          value={editDueBy}
          onChange={setEditDueBy}
          label="Due Date (optional)"
          disabled={loading}
          inputClassName={styles.dateInput}
          labelClassName={styles.label}
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
