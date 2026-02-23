import styles from './TaskFilterBar.module.css';

type TaskFilter = 'all' | 'pending' | 'completed';

interface TaskFilterBarProps {
  activeFilter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
}

export default function TaskFilterBar({
  activeFilter,
  onFilterChange,
}: TaskFilterBarProps) {
  return (
    <div className={styles.filters}>
      <button
        className={`${styles.filterButton} ${
          activeFilter === 'all' ? styles.active : ''
        }`}
        onClick={() => onFilterChange('all')}
      >
        All
      </button>
      <button
        className={`${styles.filterButton} ${
          activeFilter === 'pending' ? styles.active : ''
        }`}
        onClick={() => onFilterChange('pending')}
      >
        Pending
      </button>
      <button
        className={`${styles.filterButton} ${
          activeFilter === 'completed' ? styles.active : ''
        }`}
        onClick={() => onFilterChange('completed')}
      >
        Completed
      </button>
    </div>
  );
}
