import React, { useState, useEffect } from 'react';
import ScrapForm from '../components/ScrapForm';
import ScrapFeed from '../components/ScrapFeed';
import UserSearch from '../components/UserSearch';
import { useAuth } from '../context/AuthContext';

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
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <div className="container">
      <div style={{ marginBottom: '2rem' }}>
        <h2>Página Inicial</h2>
        <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '1.5rem' }}>
          {getGreeting()}, <strong>{user?.name}</strong>! 👋 
          Bem-vindo(a) de volta ao seu Orkut.
        </p>
      </div>

      {/* Busca de Usuários */}
      <UserSearch />

      {/* Formulário de Recado */}
      <ScrapForm onScrapPosted={handleScrapPosted} />

      {/* Feed de Recados */}
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ color: '#3068B3', marginBottom: '1rem' }}>
          Últimos Recados da Rede
        </h3>
        
        {loading && (
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem', 
            color: '#666' 
          }}>
            Carregando recados...
          </div>
        )}
        
        {error && (
          <div style={{ 
            color: '#D8000C', 
            backgroundColor: '#ffebee',
            padding: '1rem',
            borderRadius: '4px',
            border: '1px solid #ffcdd2',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}
        
        {!loading && !error && scraps.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#666',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>
              💬
            </div>
            <p>Ainda não há recados na rede.</p>
            <small>Que tal ser o primeiro a deixar um recado?</small>
          </div>
        )}
        
        {!loading && !error && scraps.length > 0 && (
          <ScrapFeed scraps={scraps} />
        )}
      </div>
    </div>
  );
};

export default HomePage;