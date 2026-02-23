import { Link, useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <LoginForm onSuccess={() => navigate('/')} />
      <p className={styles.link}>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}
