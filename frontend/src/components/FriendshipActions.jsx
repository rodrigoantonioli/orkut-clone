import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from '../pages/ProfilePage.module.css';

const FriendshipActions = ({ profileUser }) => {
  const { user: currentUser, token, refreshUser } = useAuth();
  const [status, setStatus] = useState('loading'); // loading, not_friends, friends, request_sent, request_received
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser && profileUser) {
      if (currentUser.friends && currentUser.friends.some(friend => friend._id === profileUser._id)) {
        setStatus('friends');
      } else if (currentUser.friendRequestsSent && currentUser.friendRequestsSent.some(req => req._id === profileUser._id)) {
        setStatus('request_sent');
      } else if (currentUser.friendRequestsReceived && currentUser.friendRequestsReceived.some(req => req._id === profileUser._id)) {
        setStatus('request_received');
      } else {
        setStatus('not_friends');
      }
    }
  }, [currentUser, profileUser]);

  const handleAction = async (action) => {
    // Confirmação para ações críticas
    if (action === 'remove' && !confirm(`Tem certeza que deseja desfazer a amizade com ${profileUser.name}?`)) {
      return;
    }
    
    if (action === 'reject' && !confirm(`Tem certeza que deseja rejeitar o pedido de ${profileUser.name}?`)) {
      return;
    }

    setIsLoading(true);
    
    const endpointMap = {
      send: `/api/friends/request/${profileUser._id}`,
      accept: `/api/friends/accept/${profileUser._id}`,
      reject: `/api/friends/reject/${profileUser._id}`,
      remove: `/api/friends/remove/${profileUser._id}`,
    };
    
    const methodMap = {
      send: 'POST',
      accept: 'POST',
      reject: 'POST',
      remove: 'DELETE',
    };

    try {
      const response = await fetch(endpointMap[action], {
        method: methodMap[action],
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error('Ação falhou.');
      
      await refreshUser();
    } catch (error) {
      console.error(`Erro ao ${action}:`, error);
      alert('Erro ao executar a ação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!currentUser || currentUser._id === profileUser._id) return null;

  return (
    <div className={styles.friendshipActions}>
      {(() => {
        switch (status) {
          case 'loading':
            return (
              <button className={styles.friendshipButton} disabled>
                Carregando...
              </button>
            );
          
          case 'friends':
            return (
              <button 
                className={`${styles.friendshipButton} ${styles.danger}`}
                onClick={() => handleAction('remove')}
                disabled={isLoading}
              >
                {isLoading ? 'Removendo...' : 'Desfazer Amizade'}
              </button>
            );
          
          case 'request_sent':
            return (
              <button className={styles.friendshipButton} disabled>
                ✓ Pedido Enviado
              </button>
            );
          
          case 'request_received':
            return (
              <div className={styles.buttonGroup}>
                <button 
                  className={styles.friendshipButton}
                  onClick={() => handleAction('accept')}
                  disabled={isLoading}
                >
                  {isLoading ? 'Aceitando...' : 'Aceitar'}
                </button>
                <button 
                  className={`${styles.friendshipButton} ${styles.secondary}`}
                  onClick={() => handleAction('reject')}
                  disabled={isLoading}
                >
                  {isLoading ? 'Rejeitando...' : 'Rejeitar'}
                </button>
              </div>
            );
          
          case 'not_friends':
          default:
            return (
              <button 
                className={styles.friendshipButton}
                onClick={() => handleAction('send')}
                disabled={isLoading}
              >
                {isLoading ? 'Enviando...' : '+ Adicionar aos Amigos'}
              </button>
            );
        }
      })()}
    </div>
  );
};

export default FriendshipActions; 