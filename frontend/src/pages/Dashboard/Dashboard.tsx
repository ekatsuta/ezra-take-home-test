import { useAuth } from '../../contexts/AuthContext';
import Tasks from '../../components/tasks/TaskBoard/TaskBoard';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1 className={styles.title}>Task Management</h1>
        <div className={styles.userSection}>
          <span className={styles.userName}>Welcome, {user?.name}!</span>
          <button onClick={logout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </header>
      <main>
        <Tasks />
      </main>
    </div>
  );
}
