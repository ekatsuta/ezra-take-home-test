import { useHealthCheck } from './hooks/useHealthCheck';
import './App.css';

function App() {
  const { health, loading, error } = useHealthCheck();

  return (
    <div className="App">
      <header className="App-header">
        <h1>Task Management App</h1>

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
}

export default App;
