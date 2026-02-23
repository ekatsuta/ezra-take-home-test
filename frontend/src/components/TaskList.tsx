import { useEffect, useState } from 'react';
import { Task, TaskCreate, TaskUpdate } from '../types';
import { api } from '../services/api';
import TaskForm from './TaskForm';
import TaskItem from './TaskItem';
import styles from './TaskList.module.css';

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const fetchTasks = async () => {
    try {
      setError('');
      const data = await api.getTasks();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (taskData: TaskCreate) => {
    const newTask = await api.createTask(taskData);
    setTasks([newTask, ...tasks]);
  };

  const handleUpdateTask = async (id: number, updates: TaskUpdate) => {
    const updatedTask = await api.updateTask(id, updates);
    setTasks(tasks.map(task => (task.id === id ? updatedTask : task)));
  };

  const handleToggleStatus = async (
    id: number,
    status: 'pending' | 'completed'
  ) => {
    await api.updateTask(id, { status });
    setTasks(tasks.map(task => (task.id === id ? { ...task, status } : task)));
  };

  const handleDeleteTask = async (id: number) => {
    await api.deleteTask(id);
    setTasks(tasks.filter(task => task.id !== id));
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };

  if (loading) {
    return <div className={styles.loading}>Loading tasks...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>My Tasks</h2>
        <div className={styles.stats}>
          <span className={styles.stat}>
            Total: <strong>{taskStats.total}</strong>
          </span>
          <span className={styles.stat}>
            Pending: <strong>{taskStats.pending}</strong>
          </span>
          <span className={styles.stat}>
            Completed: <strong>{taskStats.completed}</strong>
          </span>
        </div>
      </div>

      <TaskForm onSubmit={handleCreateTask} />

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.filters}>
        <button
          className={`${styles.filterButton} ${
            filter === 'all' ? styles.active : ''
          }`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`${styles.filterButton} ${
            filter === 'pending' ? styles.active : ''
          }`}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button
          className={`${styles.filterButton} ${
            filter === 'completed' ? styles.active : ''
          }`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
      </div>

      <div className={styles.tasksList}>
        {filteredTasks.length === 0 ? (
          <div className={styles.emptyState}>
            {filter === 'all'
              ? 'No tasks yet. Create one to get started!'
              : `No ${filter} tasks.`}
          </div>
        ) : (
          filteredTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDeleteTask}
              onUpdate={handleUpdateTask}
            />
          ))
        )}
      </div>
    </div>
  );
}
