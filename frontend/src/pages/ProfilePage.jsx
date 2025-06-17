import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import ScrapFeed from '../components/ScrapFeed';
import { useAuth } from '../context/AuthContext';
import FriendshipActions from '../components/FriendshipActions';
import styles from './ProfilePage.module.css';

const ProfilePage = () => {
  const { id: userId } = useParams();
  const { user: currentUser, token, refreshUser } = useAuth();
  
  const [profileUser, setProfileUser] = useState(null);
  const [scraps, setScraps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para o formulário de upload
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchProfileData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [userRes, scrapsRes] = await Promise.all([
        fetch(`/api/users/${userId}`),
        fetch(`/api/scraps/user/${userId}`)
      ]);

      if (!userRes.ok) throw new Error('Usuário não encontrado.');
      const userData = await userRes.json();
      setProfileUser(userData);

      if (scrapsRes.ok) {
        const scrapsData = await scrapsRes.json();
        setScraps(scrapsData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setUploadError('');
    setUploadSuccess('');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    
    setUploading(true);
    setUploadError('');
    setUploadSuccess('');
    
    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await fetch('/api/upload/profile', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Falha no upload.');
      
      setUploadSuccess('Foto atualizada com sucesso!');
      setSelectedFile(null);
      
      await fetchProfileData();
      await refreshUser();
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setUploadSuccess(''), 3000);
      
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getFileInputText = () => {
    if (selectedFile) {
      return `📁 ${selectedFile.name}`;
    }
    return '📤 Clique para selecionar uma foto';
  };

  if (loading) return <p className="container">Carregando perfil...</p>;
  if (error) return <p className="container" style={{ color: 'red' }}>{error}</p>;
  if (!profileUser) return <p className="container">Perfil não encontrado.</p>;

  const isOwnProfile = currentUser && currentUser._id === profileUser._id;

  return (
    <div className={styles.profilePage}>
      <div className={styles.profileGrid}>
        {/* Cabeçalho do Perfil */}
        <div className={styles.profileHeader}>
          <img 
            src={profileUser.profilePicture || '/uploads/default-avatar.svg'} 
            alt={`Foto de ${profileUser.name}`} 
            className={styles.profilePicture} 
          />
          <h1 className={styles.profileName}>{profileUser.name}</h1>
          <p className={styles.profileEmail}>{profileUser.email}</p>
        </div>

        {/* Estatísticas */}
        <div className={styles.profileSection}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>estatísticas</h3>
          </div>
          <div className={styles.sectionContent}>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>{profileUser.friends?.length || 0}</span>
                <span className={styles.statLabel}>amigos</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>{scraps.length}</span>
                <span className={styles.statLabel}>recados</span>
              </div>
            </div>
          </div>
        </div>

        {/* Informações do Perfil */}
        <div className={styles.profileSection}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>informações</h3>
          </div>
          <div className={styles.sectionContent}>
            <div className={styles.profileInfo}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>nome:</span>
                <span className={styles.infoValue}>{profileUser.name}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>email:</span>
                <span className={styles.infoValue}>{profileUser.email}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>membro desde:</span>
                <span className={styles.infoValue}>{formatDate(profileUser.createdAt)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>status:</span>
                <span className={styles.infoValue}>
                  {profileUser.friends?.some(friend => friend._id === currentUser?._id) ? '👥 amigo' : '👤 usuário'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ações de Amizade ou Upload */}
        {isOwnProfile ? (
          <div className={styles.profileSection}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>trocar foto do perfil</h3>
            </div>
            <div className={styles.sectionContent}>
              <form onSubmit={handleUpload} className={styles.uploadForm}>
                <div className={styles.fileInputWrapper}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className={styles.fileInput}
                    id="fileInput"
                  />
                  <label 
                    htmlFor="fileInput" 
                    className={`${styles.fileInputLabel} ${selectedFile ? styles.hasFile : ''}`}
                  >
                    {getFileInputText()}
                  </label>
                </div>
                
                <button 
                  type="submit" 
                  disabled={!selectedFile || uploading}
                  className={styles.uploadButton}
                >
                  {uploading ? 'enviando...' : 'atualizar foto'}
                </button>
                
                {uploadError && <div className={styles.uploadError}>{uploadError}</div>}
                {uploadSuccess && <div className={styles.uploadSuccess}>{uploadSuccess}</div>}
              </form>
            </div>
          </div>
        ) : (
          <div className={styles.profileSection}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>ações</h3>
            </div>
            <div className={styles.sectionContent}>
              <FriendshipActions profileUser={profileUser} />
            </div>
          </div>
        )}

        {/* Mural de Recados */}
        <div className={styles.profileSection}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>mural de recados ({scraps.length})</h3>
          </div>
          <div className={styles.sectionContent}>
            {scraps.length > 0 ? (
              <ScrapFeed scraps={scraps} />
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.icon}>💬</div>
                <p>
                  {isOwnProfile 
                    ? 'você ainda não recebeu recados' 
                    : `${profileUser.name} ainda não recebeu recados`
                  }
                </p>
                <small>
                  {isOwnProfile 
                    ? 'seus amigos podem deixar recados aqui para você!'
                    : 'que tal ser o primeiro a deixar um recado?'
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

export default ProfilePage; 