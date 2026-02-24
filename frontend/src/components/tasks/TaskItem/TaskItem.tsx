import { Task } from '../../../types';
import { TASK_STATUS } from '../../../constants';
import { formatDate } from '../../../utils/date';
import styles from './TaskItem.module.css';

interface TaskItemProps {
  task: Task;
  loading: boolean;
  onToggleStatus: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function TaskItem({
  task,
  loading,
  onToggleStatus,
  onEdit,
  onDelete,
}: TaskItemProps) {
  return (
    <div
      data-testid={`task-${task.id}`}
      className={`${styles.taskItem} ${
        task.status === TASK_STATUS.COMPLETED && styles.completed
      }`}
    >
      <div className={styles.taskContent}>
        <div className={styles.taskHeader}>
          <input
            type="checkbox"
            checked={task.status === TASK_STATUS.COMPLETED}
            onChange={onToggleStatus}
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
        </div>
      </div>
      <div className={styles.taskActions}>
        <button
          onClick={onEdit}
          disabled={loading}
          className={styles.editButton}
          aria-label="Edit task"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
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
