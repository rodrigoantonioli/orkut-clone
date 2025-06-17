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
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCommunities: 0,
    onlineUsers: 0
  });

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

  const fetchStats = async () => {
    try {
      const [usersRes, communitiesRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/communities')
      ]);
      
      if (usersRes.ok && communitiesRes.ok) {
        const usersData = await usersRes.json();
        const communitiesData = await communitiesRes.json();
        
        setStats({
          totalUsers: usersData.users?.length || 0,
          totalCommunities: communitiesData.communities?.length || 0,
          onlineUsers: Math.floor(Math.random() * 20) + 5 // Simular usuários online
        });
      }
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  };

  useEffect(() => {
    fetchScraps();
    fetchStats();
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
          {getGreeting()}, {user?.name}!
        </h2>
        <p className={styles.dateInfo}>
          hoje é {formatDate()}
        </p>
      </div>

      {/* Estatísticas da Rede */}
      <div className={styles.statsSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>estatísticas da rede</h3>
        </div>
        <div className={styles.sectionContent}>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{stats.totalUsers}</span>
              <span className={styles.statLabel}>usuários</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{stats.totalCommunities}</span>
              <span className={styles.statLabel}>comunidades</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{stats.onlineUsers}</span>
              <span className={styles.statLabel}>online agora</span>
            </div>
          </div>
        </div>
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

      {/* Novidades do Orkut */}
      <div className={styles.newsSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>novidades do orkut</h3>
        </div>
        <div className={styles.sectionContent}>
          <div className={styles.newsItem}>
            <div className={styles.newsIcon}>🎉</div>
            <div className={styles.newsText}>
              <strong>bem-vindos ao orkut clone!</strong>
              <p>uma versão nostálgica da rede social que marcou época. conecte-se com amigos, participe de comunidades e compartilhe momentos especiais.</p>
            </div>
          </div>
          <div className={styles.newsItem}>
            <div className={styles.newsIcon}>👥</div>
            <div className={styles.newsText}>
              <strong>faça novos amigos</strong>
              <p>use a busca para encontrar pessoas interessantes e expandir sua rede de contatos.</p>
            </div>
          </div>
          <div className={styles.newsItem}>
            <div className={styles.newsIcon}>🏘️</div>
            <div className={styles.newsText}>
              <strong>participe de comunidades</strong>
              <p>explore comunidades sobre seus interesses e conecte-se com pessoas que pensam como você.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Recados */}
      <div className={styles.scrapsSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>deixar recado</h3>
        </div>
        <div className={styles.sectionContent}>
          <ScrapForm onScrapPosted={handleScrapPosted} />
        </div>
      </div>

      {/* Feed de Recados */}
      <div className={styles.feedSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>últimos recados da rede ({scraps.length})</h3>
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