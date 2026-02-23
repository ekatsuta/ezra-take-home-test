import { Task, TaskUpdate } from '../../../types';
import TaskCard from '../TaskCard/TaskCard';
import styles from './TaskList.module.css';

interface TaskListProps {
  tasks: Task[];
  filter: 'all' | 'pending' | 'completed';
  onToggleStatus: (
    id: number,
    status: 'pending' | 'completed'
  ) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onUpdate: (id: number, updates: TaskUpdate) => Promise<void>;
}

export default function TaskList({
  tasks,
  filter,
  onToggleStatus,
  onDelete,
  onUpdate,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className={styles.emptyState}>
        {filter === 'all'
          ? 'No tasks yet. Create one to get started!'
          : `No ${filter} tasks.`}
      </div>
    );
  }

  return (
    <div className={styles.tasksList}>
      {tasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}
