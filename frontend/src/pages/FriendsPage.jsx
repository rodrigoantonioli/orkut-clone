import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import styles from './FriendsPage.module.css';

const FriendsPage = () => {
  const { token, user, refreshUser } = useAuth();
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [friendsRes, requestsRes] = await Promise.all([
        fetch('/api/friends', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/friends/requests', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (!friendsRes.ok || !requestsRes.ok) {
        throw new Error('Falha ao carregar dados de amigos.');
      }

      const friendsData = await friendsRes.json();
      const requestsData = await requestsRes.json();

      setFriends(friendsData);
      setRequests(requestsData.filter(req => req._id !== user._id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRequestAction = async (senderId, action) => {
    try {
      const response = await fetch(`/api/friends/${action}/${senderId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Ação falhou.');
      
      await refreshUser();
      await fetchData();
    } catch (err) {
      console.error(`Erro ao ${action} pedido: `, err);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    if (!confirm('Tem certeza que deseja remover este amigo?')) return;
    
    try {
      const response = await fetch(`/api/friends/remove/${friendId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Falha ao remover amigo.');
      
      await refreshUser();
      await fetchData();
    } catch (err) {
      console.error('Erro ao remover amigo: ', err);
    }
  };

  if (loading) return <p className="container">Carregando...</p>;
  if (error) return <p className="container" style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="container">
      <div className={styles.infoBox}>
        <h2>
          Pedidos de Amizade
          <span className={styles.counter}>({requests.length})</span>
        </h2>
        {requests.length > 0 ? (
          <ul className={styles.list}>
            {requests.map(req => (
              <li key={req._id} className={styles.listItem}>
                <Link to={`/perfil/${req._id}`} className={styles.user}>
                  <img src={req.profilePicture || '/uploads/default-avatar.svg'} alt={req.name} className={styles.avatar} />
                  <div className={styles.userInfo}>
                    <span className={styles.name}>{req.name}</span>
                    <span className={styles.email}>{req.email}</span>
                  </div>
                </Link>
                <div className={styles.actions}>
                  <button onClick={() => handleRequestAction(req._id, 'accept')} className={styles.button}>
                    Aceitar
                  </button>
                  <button onClick={() => handleRequestAction(req._id, 'reject')} className={`${styles.button} ${styles.rejectButton}`}>
                    Rejeitar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.icon}>👥</div>
            <p>Nenhum pedido de amizade pendente.</p>
            <small>Quando alguém te enviar um pedido, ele aparecerá aqui.</small>
          </div>
        )}
      </div>

      <div className={styles.infoBox}>
        <h2>
          Meus Amigos
          <span className={styles.counter}>({friends.length})</span>
        </h2>
        {friends.length > 0 ? (
          <ul className={styles.list}>
            {friends.map(friend => (
              <li key={friend._id} className={styles.listItem}>
                <Link to={`/perfil/${friend._id}`} className={styles.user}>
                  <img src={friend.profilePicture || '/uploads/default-avatar.svg'} alt={friend.name} className={styles.avatar} />
                  <div className={styles.userInfo}>
                    <span className={styles.name}>{friend.name}</span>
                    <span className={styles.email}>{friend.email}</span>
                  </div>
                </Link>
                <div className={styles.actions}>
                  <button onClick={() => handleRemoveFriend(friend._id)} className={`${styles.button} ${styles.removeButton}`}>
                    Remover
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.icon}>😊</div>
            <p>Você ainda não tem amigos.</p>
            <small>Que tal visitar alguns perfis e adicionar pessoas?</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsPage; 