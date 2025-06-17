import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import styles from './CommunitiesPage.module.css';

const CommunitiesPage = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  
  // Estados para comunidades
  const [communities, setCommunities] = useState([]);
  const [myCommunities, setMyCommunities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para filtros e busca
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});

  // Estados para o formulário de criação
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Outros',
    tags: '',
    rules: '',
    isPrivate: false,
  });
  const [formError, setFormError] = useState('');
  const [creating, setCreating] = useState(false);

  // Buscar dados iniciais
  useEffect(() => {
    Promise.all([
      fetchCommunities(),
      fetchCategories(),
      fetchMyCommunities(),
    ]);
  }, []);

  // Refetch quando filtros mudarem
  useEffect(() => {
    fetchCommunities();
  }, [selectedCategory, searchQuery, sortBy, currentPage]);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        category: selectedCategory,
        search: searchQuery,
        sort: sortBy,
        page: currentPage,
        limit: 12
      });

      const response = await fetch(`/api/communities?${params}`);
      if (!response.ok) throw new Error('Falha ao buscar comunidades.');
      
      const data = await response.json();
      setCommunities(data.communities || []);
      setPagination(data.pagination || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/communities/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Erro ao buscar categorias:', err);
    }
  };

  const fetchMyCommunities = async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/communities/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMyCommunities(data);
      }
    } catch (err) {
      console.error('Erro ao buscar minhas comunidades:', err);
    }
  };

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    setFormError('');
    setCreating(true);

    try {
      const response = await fetch('/api/communities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Falha ao criar comunidade.');
      }

      // Reset form e redirecionar
      setFormData({
        name: '',
        description: '',
        category: 'Outros',
        tags: '',
        rules: '',
        isPrivate: false,
      });
      setShowCreateForm(false);
      navigate(`/comunidades/${data._id}`);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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

  return (
    <div className="container">
      <div className={styles.pageGrid}>
        {/* Coluna Principal */}
        <div className={styles.mainContent}>
          {/* Cabeçalho com filtros */}
          <div className={styles.header}>
            <h2>Explorar Comunidades</h2>
            <div className={styles.filters}>
              <div className={styles.searchBox}>
                <input
                  type="text"
                  placeholder="Buscar comunidades..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={styles.searchInput}
                />
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className={styles.select}
              >
                <option value="all">Todas as categorias</option>
                {categories.map(cat => (
                  <option key={cat.name} value={cat.name}>
                    {getCategoryIcon(cat.name)} {cat.name} ({cat.count})
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className={styles.select}
              >
                <option value="newest">Mais recentes</option>
                <option value="popular">Mais populares</option>
                <option value="active">Mais ativas</option>
                <option value="oldest">Mais antigas</option>
              </select>
            </div>
          </div>

          {/* Lista de comunidades */}
          <div className={styles.infoBox}>
            {loading && (
              <div className={styles.loading}>
                <p>Carregando comunidades...</p>
              </div>
            )}
            
            {error && (
              <div className={styles.error}>
                {error}
              </div>
            )}

            {!loading && communities.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🏘️</div>
                <p>Nenhuma comunidade encontrada</p>
                <small>
                  {searchQuery || selectedCategory !== 'all' 
                    ? 'Tente ajustar os filtros de busca'
                    : 'Seja o primeiro a criar uma comunidade!'
                  }
                </small>
              </div>
            )}

            <div className={styles.communityGrid}>
              {communities.map((community) => (
                <div key={community._id} className={styles.communityCard}>
                  <Link to={`/comunidades/${community._id}`} className={styles.communityLink}>
                    <div className={styles.communityHeader}>
                      <div className={styles.communityIcon}>
                        {getCategoryIcon(community.category)}
                      </div>
                      <div className={styles.categoryBadge}>
                        {community.category}
                      </div>
                    </div>
                    <h3 className={styles.communityName}>{community.name}</h3>
                    <p className={styles.communityDescription}>
                      {community.description}
                    </p>
                    <div className={styles.communityStats}>
                      <span>👥 {community.stats?.memberCount || 0} membros</span>
                      <span>💬 {community.stats?.topicCount || 0} tópicos</span>
                    </div>
                    <div className={styles.communityFooter}>
                      <span className={styles.creator}>
                        por {community.creator?.name}
                      </span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            {/* Paginação */}
            {pagination.total > 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  disabled={!pagination.hasPrev}
                  className={styles.pageButton}
                >
                  ← Anterior
                </button>
                <span className={styles.pageInfo}>
                  Página {pagination.current} de {pagination.total}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!pagination.hasNext}
                  className={styles.pageButton}
                >
                  Próxima →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Barra Lateral */}
        <div className={styles.sidebar}>
          {/* Minhas Comunidades */}
          {myCommunities.length > 0 && (
            <div className={styles.infoBox}>
              <h3>Minhas Comunidades</h3>
              <ul className={styles.myCommunitiesList}>
                {myCommunities.slice(0, 5).map(community => (
                  <li key={community._id}>
                    <Link to={`/comunidades/${community._id}`}>
                      {getCategoryIcon(community.category)} {community.name}
                    </Link>
                  </li>
                ))}
              </ul>
              {myCommunities.length > 5 && (
                <small>e mais {myCommunities.length - 5} comunidades...</small>
              )}
            </div>
          )}

          {/* Criar Comunidade */}
          <div className={styles.infoBox}>
            <h3>Criar Comunidade</h3>
            {!showCreateForm ? (
              <button
                onClick={() => setShowCreateForm(true)}
                className={styles.createButton}
              >
                + Nova Comunidade
              </button>
            ) : (
              <form onSubmit={handleCreateCommunity} className={styles.form}>
                <input
                  type="text"
                  name="name"
                  placeholder="Nome da comunidade"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className={styles.input}
                />
                
                <textarea
                  name="description"
                  placeholder="Descreva sua comunidade"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  className={styles.textarea}
                />

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={styles.select}
                >
                  {categories.map(cat => (
                    <option key={cat.name} value={cat.name}>
                      {getCategoryIcon(cat.name)} {cat.name}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  name="tags"
                  placeholder="Tags (separadas por vírgula)"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className={styles.input}
                />

                <textarea
                  name="rules"
                  placeholder="Regras da comunidade (opcional)"
                  value={formData.rules}
                  onChange={handleInputChange}
                  rows="2"
                  className={styles.textarea}
                />

                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    name="isPrivate"
                    checked={formData.isPrivate}
                    onChange={handleInputChange}
                  />
                  Comunidade privada
                </label>

                {formError && (
                  <div className={styles.formError}>{formError}</div>
                )}

                <div className={styles.formButtons}>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className={styles.cancelButton}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className={styles.submitButton}
                  >
                    {creating ? 'Criando...' : 'Criar'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunitiesPage; 