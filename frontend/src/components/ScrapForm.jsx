import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './ScrapForm.module.css';

const ScrapForm = ({ onScrapPosted }) => {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const { token } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!content.trim()) {
      setError('O scrap não pode estar em branco.');
      return;
    }

    try {
      const response = await fetch('/api/scraps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Não foi possível postar o scrap.');
      }

      setContent('');
      onScrapPosted(data); // Informa o componente pai sobre o novo scrap
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formBox}>
      <h3>Deixar um recado</h3>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Escreva um recado..."
        rows="3"
        className={styles.textarea}
      />
      {error && <p className={styles.error}>{error}</p>}
      <button type="submit" className={styles.button}>
        Postar Recado
      </button>
    </form>
  );
};

export default ScrapForm; 