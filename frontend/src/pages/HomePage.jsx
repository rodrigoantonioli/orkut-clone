import React, { useState, useEffect } from 'react';
import ScrapForm from '../components/ScrapForm';
import ScrapFeed from '../components/ScrapFeed';
import UserSearch from '../components/UserSearch';
import { useAuth } from '../context/AuthContext';
import styles from './HomePage.module.css';

const HomePage = () => {
  const { user } = useAuth();
  const [scraps, setScraps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchScraps = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/scraps');
      if (!response.ok) {
        throw new Error('Não foi possível carregar os scraps.');
      }
      const data = await response.json();
      setScraps(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScraps();
  }, []);

  const handleScrapPosted = () => {
    fetchScraps();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'bom dia';
    if (hour < 18) return 'boa tarde';
    return 'boa noite';
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={styles.homePage}>
      {/* Header da página */}
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>
          Bem-vindo(a), {user?.name}
        </h2>
        <p className={styles.dateInfo}>
          {getGreeting()} · {formatDate()}
        </p>
      </div>

      {/* Seção de Busca */}
      <div className={styles.searchSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>buscar pessoas</h3>
        </div>
        <div className={styles.sectionContent}>
          <UserSearch />
        </div>
      </div>

      {/* Seção de Recados */}
      <div className={styles.scrapsSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>recados</h3>
        </div>
        <div className={styles.sectionContent}>
          <ScrapForm onScrapPosted={handleScrapPosted} />
        </div>
      </div>

      {/* Feed de Recados */}
      <div className={styles.feedSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>últimos recados da rede</h3>
        </div>
        <div className={styles.sectionContent}>
          {loading && (
            <div className={styles.loadingMessage}>
              carregando recados...
            </div>
          )}
          
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}
          
          {!loading && !error && scraps.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>💬</div>
              <p>ainda não há recados na rede.</p>
              <small>que tal ser o primeiro a deixar um recado?</small>
            </div>
          )}
          
          {!loading && !error && scraps.length > 0 && (
            <ScrapFeed scraps={scraps} />
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;