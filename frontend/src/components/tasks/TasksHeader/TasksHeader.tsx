import styles from './TasksHeader.module.css';

interface TasksHeaderProps {
  total: number;
  pending: number;
  completed: number;
}

export default function TasksHeader({
  total,
  pending,
  completed,
}: TasksHeaderProps) {
  return (
    <div className={styles.header}>
      <h2 className={styles.title}>My Tasks</h2>
      <div className={styles.stats}>
        <span className={styles.stat}>
          Total: <strong>{total}</strong>
        </span>
        <span className={styles.stat}>
          Pending: <strong>{pending}</strong>
        </span>
        <span className={styles.stat}>
          Completed: <strong>{completed}</strong>
        </span>
      </div>
    </div>
  );
}
