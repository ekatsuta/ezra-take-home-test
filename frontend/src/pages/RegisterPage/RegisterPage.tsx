import { Link, useNavigate } from 'react-router-dom';
import RegisterForm from '../../components/forms/RegisterForm/RegisterForm';
import styles from './RegisterPage.module.css';

export default function RegisterPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <RegisterForm onSuccess={() => navigate('/')} />
      <p className={styles.link}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
