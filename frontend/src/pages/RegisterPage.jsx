import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './LoginPage.module.css'; // Reutilizando os estilos da página de login

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Todos os campos são obrigatórios.');
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const responseBody = await response.text();
      const data = responseBody ? JSON.parse(responseBody) : {};

      if (!response.ok) {
        throw new Error(data.message || 'Falha no registro.');
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
        <p>Crie sua conta para continuar.</p>
        <form onSubmit={handleSubmit}>
          <input
            className={styles.input}
            type="text"
            placeholder="Nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
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
            Criar conta
          </button>
        </form>
        <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
          Já tem uma conta? <Link to="/login">Faça login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage; 