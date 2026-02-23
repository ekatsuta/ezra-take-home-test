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
  const stats = [
    { label: 'Total', value: total },
    { label: 'Pending', value: pending },
    { label: 'Completed', value: completed },
  ];

  return (
    <div className={styles.header}>
      <h2 className={styles.title}>My Tasks</h2>
      <div className={styles.stats}>
        {stats.map(stat => (
          <span key={stat.label} className={styles.stat}>
            {stat.label}: <strong>{stat.value}</strong>
          </span>
        ))}
      </div>
    </div>
  );
}
