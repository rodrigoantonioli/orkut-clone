import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './CommunityDetailPage.module.css';

const CommunityDetailPage = () => {
  const { id: communityId } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [community, setCommunity] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Para o formulário de novo tópico
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [showTopicForm, setShowTopicForm] = useState(false);

  const fetchCommunityData = useCallback(async () => {
    setLoading(true);
    try {
      const [communityRes, topicsRes] = await Promise.all([
        fetch(`/api/communities/${communityId}`),
        fetch(`/api/topics/for/${communityId}`),
      ]);

      if (!communityRes.ok) throw new Error('Comunidade não encontrada.');
      const communityData = await communityRes.json();
      setCommunity(communityData);
      
      if (topicsRes.ok) {
        const topicsData = await topicsRes.json();
        setTopics(topicsData);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [communityId]);

  useEffect(() => {
    fetchCommunityData();
  }, [fetchCommunityData]);
  
  const handleJoinLeave = async () => {
    setActionLoading(true);
    const action = isMember ? 'leave' : 'join';
    
    try {
      const response = await fetch(`/api/communities/${communityId}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Falha ao ${action === 'join' ? 'entrar na' : 'sair da'} comunidade.`);
      }
      
      await fetchCommunityData();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;

    try {
      const response = await fetch(`/api/topics/in/${communityId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ title: newTopicTitle.trim() }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Falha ao criar tópico.');
      }
      
      const newTopic = await response.json();
      setNewTopicTitle('');
      setShowTopicForm(false);
      navigate(`/comunidades/${communityId}/topicos/${newTopic._id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Música': '🎵', 'Filmes': '🎬', 'Livros': '📚', 'Esportes': '⚽',
      'Tecnologia': '💻', 'Jogos': '🎮', 'Culinária': '🍳', 'Viagem': '✈️',
      'Arte': '🎨', 'Educação': '🎓', 'Negócios': '💼', 'Saúde': '🏥',
      'Moda': '👗', 'Fotografia': '📸', 'Animais': '🐾', 'Humor': '😄',
      'Religião': '⛪', 'Política': '🏛️', 'Ciência': '🔬', 'Outros': '📂'
    };
    return icons[category] || '📂';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) return (
    <div className="container">
      <div className={styles.loading}>
        <p>Carregando comunidade...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="container">
      <div className={styles.error}>
        {error}
        <button onClick={() => navigate('/comunidades')} className={styles.backButton}>
          ← Voltar às comunidades
        </button>
      </div>
    </div>
  );
  
  if (!community) return (
    <div className="container">
      <div className={styles.notFound}>
        <h2>Comunidade não encontrada</h2>
        <button onClick={() => navigate('/comunidades')} className={styles.backButton}>
          ← Voltar às comunidades
        </button>
      </div>
    </div>
  );

  const isMember = user && community.members.some(member => member._id === user._id);
  const isCreator = user && community.creator._id === user._id;
  const isModerator = isCreator || (user && community.moderators?.some(mod => mod._id === user._id));

  return (
    <div className="container">
      <div className={styles.pageGrid}>
        {/* Coluna da Esquerda - Informações da Comunidade */}
        <div className={styles.leftColumn}>
          <div className={styles.infoBox}>
            <div className={styles.communityHeader}>
              <div className={styles.communityIcon}>
                {getCategoryIcon(community.category)}
              </div>
              <div className={styles.communityInfo}>
                <div className={styles.categoryBadge}>
                  {community.category}
                </div>
                <h1 className={styles.communityName}>{community.name}</h1>
                <p className={styles.communityDescription}>{community.description}</p>
              </div>
            </div>

            <div className={styles.communityStats}>
              <div className={styles.stat}>
                <span className={styles.statNumber}>{community.stats?.memberCount || 0}</span>
                <span className={styles.statLabel}>Membros</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>{community.stats?.topicCount || 0}</span>
                <span className={styles.statLabel}>Tópicos</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>{community.stats?.postCount || 0}</span>
                <span className={styles.statLabel}>Posts</span>
              </div>
            </div>

            <div className={styles.communityMeta}>
              <p className={styles.creatorInfo}>
                <strong>Criada por:</strong> {community.creator.name}
              </p>
              <p className={styles.dateInfo}>
                <strong>Data:</strong> {formatDate(community.createdAt)}
              </p>
              {community.isPrivate && (
                <div className={styles.privateBadge}>
                  🔒 Comunidade Privada
                </div>
              )}
            </div>

            {/* Tags */}
            {community.tags && community.tags.length > 0 && (
              <div className={styles.tags}>
                <h4>Tags:</h4>
                <div className={styles.tagList}>
                  {community.tags.map((tag, index) => (
                    <span key={index} className={styles.tag}>
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Regras */}
            {community.rules && (
              <div className={styles.rules}>
                <h4>Regras da Comunidade:</h4>
                <p>{community.rules}</p>
              </div>
            )}

            {/* Ações */}
            {user && (
              <div className={styles.actions}>
                {!isCreator && (
                  <button 
                    onClick={handleJoinLeave} 
                    disabled={actionLoading}
                    className={`${styles.actionButton} ${isMember ? styles.leaveButton : styles.joinButton}`}
                  >
                    {actionLoading ? 'Carregando...' : (isMember ? 'Sair da Comunidade' : 'Entrar na Comunidade')}
                  </button>
                )}
                {isCreator && (
                  <div className={styles.creatorBadge}>
                    👑 Você é o criador desta comunidade
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Lista de Membros */}
          <div className={styles.infoBox}>
            <h3>Membros ({community.members.length})</h3>
            <div className={styles.membersList}>
              {community.members.slice(0, 10).map(member => (
                <Link 
                  key={member._id} 
                  to={`/perfil/${member._id}`}
                  className={styles.memberItem}
                >
                  <img 
                    src={member.profilePicture || '/uploads/default-avatar.svg'} 
                    alt={member.name}
                    className={styles.memberAvatar}
                  />
                  <span className={styles.memberName}>
                    {member.name}
                    {member._id === community.creator._id && ' 👑'}
                    {community.moderators?.some(mod => mod._id === member._id) && member._id !== community.creator._id && ' ⭐'}
                  </span>
                </Link>
              ))}
            </div>
            {community.members.length > 10 && (
              <p className={styles.moreMembers}>
                e mais {community.members.length - 10} membros...
              </p>
            )}
          </div>
        </div>

        {/* Coluna da Direita - Fórum */}
        <div className={styles.rightColumn}>
          <div className={styles.infoBox}>
            <div className={styles.forumHeader}>
              <h3>Fórum da Comunidade</h3>
              {isMember && (
                <button
                  onClick={() => setShowTopicForm(!showTopicForm)}
                  className={styles.newTopicButton}
                >
                  {showTopicForm ? '✕ Cancelar' : '+ Novo Tópico'}
                </button>
              )}
            </div>

            {/* Formulário de novo tópico */}
            {showTopicForm && isMember && (
              <form onSubmit={handleCreateTopic} className={styles.topicForm}>
                <input
                  type="text"
                  placeholder="Título do tópico..."
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  required
                  className={styles.topicInput}
                />
                <div className={styles.formButtons}>
                  <button 
                    type="button" 
                    onClick={() => setShowTopicForm(false)}
                    className={styles.cancelButton}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className={styles.submitButton}>
                    Criar Tópico
                  </button>
                </div>
              </form>
            )}

            {/* Lista de tópicos */}
            {topics.length > 0 ? (
              <div className={styles.topicsList}>
                {topics.map(topic => (
                  <div key={topic._id} className={styles.topicItem}>
                    <Link 
                      to={`/comunidades/${communityId}/topicos/${topic._id}`}
                      className={styles.topicLink}
                    >
                      <div className={styles.topicHeader}>
                        <h4 className={styles.topicTitle}>{topic.title}</h4>
                        <span className={styles.topicStats}>
                          {topic.posts?.length || 0} posts
                        </span>
                      </div>
                      <div className={styles.topicMeta}>
                        <span>por {topic.author?.name}</span>
                        <span className={styles.topicDate}>
                          {formatDate(topic.createdAt)}
                        </span>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyTopics}>
                <div className={styles.emptyIcon}>💬</div>
                <p>Nenhum tópico ainda</p>
                <small>
                  {isMember 
                    ? 'Seja o primeiro a iniciar uma discussão!' 
                    : 'Entre na comunidade para participar das discussões.'
                  }
                </small>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityDetailPage; 