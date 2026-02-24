import { useState, useEffect } from 'react';
import { Task, TaskCreate, TaskUpdate } from '../../../types';
import { api } from '../../../services/api';
import { TaskFilter, TASK_STATUS, TaskStatus } from '../../../constants';
import TasksHeader from '../TasksHeader/TasksHeader';
import TaskForm from '../TaskForm/TaskForm';
import TaskFilterBar from '../TaskFilterBar/TaskFilterBar';
import TaskList from '../TaskList/TaskList';
import styles from './TaskBoard.module.css';

export default function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<TaskFilter>('all');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const fetchedTasks = await api.getTasks();
      setTasks(fetchedTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData: TaskCreate) => {
    const newTask = await api.createTask(taskData);
    setTasks(prev => [newTask, ...prev]);
  };

  const handleToggleStatus = async (id: number, status: TaskStatus) => {
    const updatedTask = await api.updateTask(id, { status });
    setTasks(prev => prev.map(task => (task.id === id ? updatedTask : task)));
  };

  const handleDeleteTask = async (id: number) => {
    await api.deleteTask(id);
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const handleUpdateTask = async (id: number, updates: TaskUpdate) => {
    const updatedTask = await api.updateTask(id, updates);
    setTasks(prev => prev.map(task => (task.id === id ? updatedTask : task)));
  };

  // Calculate statistics
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(
    task => task.status === TASK_STATUS.PENDING
  ).length;
  const completedTasks = tasks.filter(
    task => task.status === TASK_STATUS.COMPLETED
  ).length;

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  if (loading) {
    return <div className={styles.loading}>Loading tasks...</div>;
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button onClick={fetchTasks} className={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.tasks}>
      <TasksHeader
        total={totalTasks}
        pending={pendingTasks}
        completed={completedTasks}
      />
      <TaskForm onSubmit={handleCreateTask} />
      <TaskFilterBar activeFilter={filter} onFilterChange={setFilter} />
      <TaskList
        tasks={filteredTasks}
        filter={filter}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDeleteTask}
        onUpdate={handleUpdateTask}
      />
    </div>
  );
}
