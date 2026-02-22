import { useHealthCheck } from './hooks/useHealthCheck';
import './App.css';

function App() {
  const { health, loading, error } = useHealthCheck();

  return (
    <div className="App">
      <header className="App-header">
        <h1>React + FastAPI Application</h1>

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

        <div className="info-card">
          <h3>Getting Started</h3>
          <p>This is a simple scaffolded application with:</p>
          <ul>
            <li>React + TypeScript frontend</li>
            <li>FastAPI backend</li>
            <li>Docker containerization</li>
          </ul>
        </div>
      </header>
    </div>
  );
}

export default App;
