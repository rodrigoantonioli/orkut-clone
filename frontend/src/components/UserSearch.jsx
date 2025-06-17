import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './UserSearch.module.css';

const UserSearch = () => {
  const { token, user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Debounced search
  const debouncedSearch = useCallback(
    debounce(async (searchQuery) => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Erro ao buscar usuários');

        const data = await response.json();
        setResults(data);
      } catch (err) {
        setError(err.message);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    [token]
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const sendFriendRequest = async (userId) => {
    try {
      const response = await fetch(`/api/friends/request/${userId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Erro ao enviar pedido');

      // Atualizar o resultado para mostrar que o pedido foi enviado
      setResults(prev => prev.map(u => 
        u._id === userId ? { ...u, requestSent: true } : u
      ));
    } catch (err) {
      console.error('Erro ao enviar pedido:', err);
    }
  };

  const isAlreadyFriend = (userId) => {
    if (!user?.friends) return false;
    
    return user.friends.some(friend => {
      // Se friend é um objeto (populado), verifica o _id
      if (typeof friend === 'object' && friend._id) {
        return friend._id === userId;
      }
      // Se friend é apenas uma string (ID), compara diretamente
      return friend === userId;
    });
  };

  const hasPendingRequest = (userId) => {
    if (!user?.friendRequestsSent) return false;
    
    return user.friendRequestsSent.some(request => {
      // Se request é um objeto (populado), verifica o _id
      if (typeof request === 'object' && request._id) {
        return request._id === userId;
      }
      // Se request é apenas uma string (ID), compara diretamente
      return request === userId;
    });
  };

  const getButtonState = (resultUser) => {
    if (isAlreadyFriend(resultUser._id)) {
      return { type: 'friend', text: '✓ Amigo', className: styles.friendBadge };
    }
    
    if (hasPendingRequest(resultUser._id) || resultUser.requestSent) {
      return { type: 'pending', text: 'Pedido Enviado', className: styles.sentBadge };
    }
    
    return { type: 'add', text: '+ Adicionar', className: styles.addButton };
  };

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchBox}>
        <input
          type="text"
          placeholder="Buscar pessoas..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={styles.searchInput}
        />
        {loading && <div className={styles.spinner}>🔍</div>}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {results.length > 0 && (
        <div className={styles.results}>
          <h4>Resultados da busca:</h4>
          <ul className={styles.userList}>
            {results.map(resultUser => {
              const buttonState = getButtonState(resultUser);
              
              return (
                <li key={resultUser._id} className={styles.userItem}>
                  <Link to={`/perfil/${resultUser._id}`} className={styles.userLink}>
                    <img 
                      src={resultUser.profilePicture || '/uploads/default-avatar.svg'} 
                      alt={resultUser.name}
                      className={styles.avatar}
                    />
                    <div className={styles.userInfo}>
                      <span className={styles.name}>{resultUser.name}</span>
                      <span className={styles.email}>{resultUser.email}</span>
                    </div>
                  </Link>
                  <div className={styles.actions}>
                    {buttonState.type === 'add' ? (
                      <button 
                        onClick={() => sendFriendRequest(resultUser._id)}
                        className={buttonState.className}
                      >
                        {buttonState.text}
                      </button>
                    ) : (
                      <span className={buttonState.className}>
                        {buttonState.text}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {query.length >= 2 && !loading && results.length === 0 && !error && (
        <p className={styles.noResults}>Nenhum usuário encontrado para "{query}"</p>
      )}
    </div>
  );
};

// Função debounce para otimizar as buscas
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default UserSearch; 