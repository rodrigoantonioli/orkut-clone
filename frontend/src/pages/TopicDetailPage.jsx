import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './TopicDetailPage.module.css';

const TopicDetailPage = () => {
  const { topicId } = useParams();
  const { user, token } = useAuth();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Para o formulário de novo post
  const [newPostContent, setNewPostContent] = useState('');

  const fetchTopicDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/topics/${topicId}`);
      if (!response.ok) throw new Error('Tópico não encontrado.');
      const data = await response.json();
      setTopic(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [topicId]);

  useEffect(() => {
    fetchTopicDetails();
  }, [fetchTopicDetails]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/posts/in/${topicId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: newPostContent }),
      });
      if (!response.ok) throw new Error('Falha ao criar post.');
      
      const newPost = await response.json();
      setTopic(prevTopic => ({
        ...prevTopic,
        posts: [...prevTopic.posts, newPost],
      }));
      setNewPostContent(''); // Limpa o formulário
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p className="container">Carregando tópico...</p>;
  if (error) return <p className="container" style={{ color: 'red' }}>{error}</p>;
  if (!topic) return <p className="container">Tópico não encontrado.</p>;
  
  return (
    <div className="container">
      <h1>{topic.title}</h1>
      <p>Criado por <Link to={`/perfil/${topic.author._id}`}>{topic.author.name}</Link></p>

      <div className={styles.postList}>
        {topic.posts.map(post => (
          <div key={post._id} className={styles.postBox}>
            <div className={styles.authorInfo}>
              <Link to={`/perfil/${post.author._id}`}>
                <img src={post.author.profilePicture || '/default-avatar.svg'} alt={post.author.name} className={styles.avatar} />
                <div className={styles.authorName}>{post.author.name}</div>
              </Link>
            </div>
            <div className={styles.postContent}>
              <p className={styles.postBody}>{post.content}</p>
              <div className={styles.timestamp}>
                {new Date(post.createdAt).toLocaleString('pt-BR')}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.replyBox}>
        <h3>Deixar uma resposta</h3>
        <form onSubmit={handleCreatePost} className={styles.replyForm}>
          <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Escreva sua resposta..."
              required
          />
          <button type="submit">Responder</button>
        </form>
      </div>
    </div>
  );
};

export default TopicDetailPage; 