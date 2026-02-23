import { useAuth } from '../contexts/AuthContext';
import { useHealthCheck } from '../hooks/useHealthCheck';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const { health, loading, error } = useHealthCheck();

  return (
    <div className="App">
      <header className="App-header">
        <h1>Task Management App</h1>
        <div>
          <p>Welcome, {user?.name}!</p>
          <button onClick={logout}>Logout</button>
        </div>

        <div className="status-card">
          <h2>Backend Status</h2>
          {loading && <p>Loading...</p>}
          {error && <p className="error">Error: {error}</p>}
          {health && (
            <div>
              <p className="success">Status: {health.status}</p>
              <p>{health.message}</p>
            </div>
          )}
        </div>
      </header>
    </div>
  );
};
