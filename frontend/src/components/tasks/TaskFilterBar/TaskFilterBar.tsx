import {
  TaskFilter,
  TASK_FILTERS,
  TASK_FILTER_LABELS,
} from '../../../constants/taskFilters';
import styles from './TaskFilterBar.module.css';

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
      {TASK_FILTERS.map(filter => (
        <button
          key={filter}
          className={`${styles.filterButton} ${
            activeFilter === filter ? styles.active : ''
          }`}
          onClick={() => onFilterChange(filter)}
        >
          {TASK_FILTER_LABELS[filter]}
        </button>
      ))}
    </div>
  );
}
