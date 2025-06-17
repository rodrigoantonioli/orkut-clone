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
    <div className="container">
      <div className={styles.profileGrid}>
        {/* Coluna da Esquerda */}
        <div className={styles.leftColumn}>
          {/* Foto e Nome */}
          <div className={styles.profileBox}>
            <img 
              src={profileUser.profilePicture || '/uploads/default-avatar.svg'} 
              alt={`Foto de ${profileUser.name}`} 
              className={styles.profilePicture} 
            />
            <h1 className={styles.profileName}>{profileUser.name}</h1>
            <p className={styles.profileEmail}>{profileUser.email}</p>
          </div>

          {/* Estatísticas */}
          <div className={styles.infoBox}>
            <h3>Estatísticas</h3>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <p className={styles.statNumber}>{profileUser.friends?.length || 0}</p>
                <p className={styles.statLabel}>Amigos</p>
              </div>
              <div className={styles.statItem}>
                <p className={styles.statNumber}>{scraps.length}</p>
                <p className={styles.statLabel}>Recados</p>
              </div>
            </div>
          </div>

          {/* Informações do Perfil */}
          <div className={styles.infoBox}>
            <h3>Informações</h3>
            <div className={styles.profileInfo}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Nome:</span>
                <span className={styles.infoValue}>{profileUser.name}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Email:</span>
                <span className={styles.infoValue}>{profileUser.email}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Membro desde:</span>
                <span className={styles.infoValue}>{formatDate(profileUser.createdAt)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Status:</span>
                <span className={styles.infoValue}>
                  {profileUser.friends?.some(friend => friend._id === currentUser?._id) ? '👥 Amigo' : '👤 Usuário'}
                </span>
              </div>
            </div>
          </div>

          {/* Ações de Amizade ou Upload */}
          {isOwnProfile ? (
            <div className={styles.infoBox}>
              <form onSubmit={handleUpload} className={styles.uploadForm}>
                <h3>Trocar Foto do Perfil</h3>
                
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
                  {uploading ? 'Enviando...' : 'Atualizar Foto'}
                </button>
                
                {uploadError && <div className={styles.uploadError}>{uploadError}</div>}
                {uploadSuccess && <div className={styles.uploadSuccess}>{uploadSuccess}</div>}
              </form>
            </div>
          ) : (
            <div className={styles.infoBox}>
              <h3>Ações</h3>
              <FriendshipActions profileUser={profileUser} />
            </div>
          )}
        </div>

        {/* Coluna da Direita */}
        <div className={styles.rightColumn}>
          <div className={styles.infoBox}>
            <h3>
              Mural de Recados
              <span className={styles.counter}>({scraps.length})</span>
            </h3>
            
            {scraps.length > 0 ? (
              <ScrapFeed scraps={scraps} />
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.icon}>💬</div>
                <p>
                  {isOwnProfile 
                    ? 'Você ainda não recebeu recados' 
                    : `${profileUser.name} ainda não recebeu recados`
                  }
                </p>
                <small>
                  {isOwnProfile 
                    ? 'Seus amigos podem deixar recados aqui para você!'
                    : 'Que tal ser o primeiro a deixar um recado?'
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