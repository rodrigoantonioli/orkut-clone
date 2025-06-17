import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './LoginPage.module.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const responseBody = await response.text();
      const data = responseBody ? JSON.parse(responseBody) : {};

      if (!response.ok) {
        throw new Error(data.message || 'Falha no login. Verifique suas credenciais.');
      }

      login(data);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Não foi possível conectar ao servidor.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h1>orkut</h1>
        <p>Acesse o Orkut com a sua conta.</p>
        <form onSubmit={handleSubmit}>
          <input
            className={styles.input}
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className={styles.input}
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p style={{ color: 'red', fontSize: '0.9rem' }}>{error}</p>}
          <button className={styles.button} type="submit">
            Entrar
          </button>
        </form>
        <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
          Não tem uma conta? <Link to="/register">Crie uma agora</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage; 