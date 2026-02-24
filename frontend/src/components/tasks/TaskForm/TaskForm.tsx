import { useState, FormEvent } from 'react';
import { TaskCreate } from '../../../types';
import { getTodayDate } from '../../../utils/date';
import { TextInput, Textarea, DateInput } from '../../forms/shared';
import styles from './TaskForm.module.css';

interface TaskFormProps {
  onSubmit: (task: TaskCreate) => Promise<void>;
}

export default function TaskForm({ onSubmit }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueBy, setDueBy] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onSubmit({
        title,
        description: description || undefined,
        due_by: dueBy || undefined,
      });
      setTitle('');
      setDescription('');
      setDueBy('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.formGroup}>
        <TextInput
          value={title}
          onChange={setTitle}
          placeholder="Task title"
          required
          disabled={loading}
          className={styles.input}
        />
      </div>
      <div className={styles.formGroup}>
        <Textarea
          value={description}
          onChange={setDescription}
          placeholder="Description (optional)"
          disabled={loading}
          className={styles.textarea}
          rows={3}
        />
      </div>
      <div className={styles.formGroup}>
        <DateInput
          id="dueBy"
          value={dueBy}
          onChange={setDueBy}
          label="Due Date (optional)"
          disabled={loading}
          inputClassName={styles.dateInput}
          labelClassName={styles.label}
          min={getTodayDate()}
        />
      </div>
      <div className={styles.buttonGroup}>
        <button
          type="submit"
          disabled={loading}
          className={styles.submitButton}
        >
          {loading ? 'Creating...' : 'Add Task'}
        </button>
      </div>
    </form>
  );
}
