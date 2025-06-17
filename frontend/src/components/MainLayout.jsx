import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './MainLayout.module.css';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [communities, setCommunities] = useState([]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Buscar amigos e comunidades para a sidebar
  useEffect(() => {
    if (user) {
      fetchFriends();
      fetchCommunities();
    }
  }, [user]);

  const fetchFriends = async () => {
    try {
      const response = await fetch(`/api/users/${user._id}`);
      if (response.ok) {
        const userData = await response.json();
        setFriends(userData.friends?.slice(0, 8) || []); // Mostrar apenas 8 amigos
      }
    } catch (error) {
      console.error('Erro ao buscar amigos:', error);
    }
  };

  const fetchCommunities = async () => {
    try {
      const response = await fetch(`/api/communities/user/${user._id}`);
      if (response.ok) {
        const data = await response.json();
        setCommunities(data.slice(0, 6) || []); // Mostrar apenas 6 comunidades do usuário
      }
    } catch (error) {
      console.error('Erro ao buscar comunidades:', error);
    }
  };

  // Define a classe para o NavLink ativo
  const getNavLinkClass = ({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink;

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <NavLink to="/" className={styles.logoLink}>
            <h1 className={styles.logo}>orkut</h1>
          </NavLink>
          {user && (
            <div className={styles.navAndUser}>
              <nav className={styles.nav}>
                <NavLink to="/" className={getNavLinkClass} end>início</NavLink>
                <NavLink to={`/perfil/${user._id}`} className={getNavLinkClass}>perfil</NavLink>
                <NavLink to="/amigos" className={getNavLinkClass}>amigos</NavLink>
                <NavLink to="/comunidades" className={getNavLinkClass}>comunidades</NavLink>
              </nav>
              <div className={styles.userInfo}>
                <span className={styles.welcomeText}>Olá, {user.name}!</span>
                <NavLink to={`/perfil/${user._id}`}>
                  <img 
                    src={user.profilePicture || '/uploads/default-avatar.svg'} 
                    alt="Meu Perfil" 
                    className={styles.navAvatar} 
                  />
                </NavLink>
                <button onClick={handleLogout} className={styles.logoutButton}>
                  sair
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {user && (
        <div className={styles.orkutLayout}>
          {/* Sidebar Esquerda */}
          <aside className={styles.leftSidebar}>
            <div className={styles.sidebarBox}>
              <div className={styles.userProfile}>
                <img 
                  src={user.profilePicture || '/uploads/default-avatar.svg'} 
                  alt={user.name}
                  className={styles.sidebarAvatar}
                />
                <h3 className={styles.sidebarUserName}>{user.name}</h3>
                <div className={styles.profileStats}>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>{user.friends?.length || 0}</span>
                    <span className={styles.statLabel}>amigos</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>{user.communities?.length || 0}</span>
                    <span className={styles.statLabel}>comunidades</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.sidebarBox}>
              <nav className={styles.sidebarNav}>
                <NavLink to="/" className={styles.sidebarLink}>
                  <span className={styles.linkIcon}>🏠</span> início
                </NavLink>
                <NavLink to={`/perfil/${user._id}`} className={styles.sidebarLink}>
                  <span className={styles.linkIcon}>👤</span> perfil
                </NavLink>
                <NavLink to="/amigos" className={styles.sidebarLink}>
                  <span className={styles.linkIcon}>👥</span> amigos
                </NavLink>
                <NavLink to="/comunidades" className={styles.sidebarLink}>
                  <span className={styles.linkIcon}>🏘️</span> comunidades
                </NavLink>
                <div className={styles.divider}></div>
                <NavLink to="#" className={styles.sidebarLink}>
                  <span className={styles.linkIcon}>📝</span> depoimentos
                </NavLink>
                <NavLink to="#" className={styles.sidebarLink}>
                  <span className={styles.linkIcon}>📷</span> fotos
                </NavLink>
                <NavLink to="#" className={styles.sidebarLink}>
                  <span className={styles.linkIcon}>🎬</span> vídeos
                </NavLink>
                <NavLink to="#" className={styles.sidebarLink}>
                  <span className={styles.linkIcon}>💬</span> mensagens
                </NavLink>
                <div className={styles.divider}></div>
                <NavLink to="#" className={styles.sidebarLink}>
                  <span className={styles.linkIcon}>⚙️</span> configurações
                </NavLink>
              </nav>
            </div>
          </aside>

          {/* Conteúdo Principal */}
          <main className={styles.mainContent}>
            <Outlet />
          </main>

          {/* Sidebar Direita */}
          <aside className={styles.rightSidebar}>
            {/* Amigos */}
            <div className={styles.sidebarBox}>
              <h3 className={styles.sidebarTitle}>
                meus amigos ({friends.length})
              </h3>
              <div className={styles.friendsList}>
                {friends.map((friend) => (
                  <NavLink 
                    key={friend._id} 
                    to={`/perfil/${friend._id}`}
                    className={styles.friendItem}
                  >
                    <img 
                      src={friend.profilePicture || '/uploads/default-avatar.svg'}
                      alt={friend.name}
                      className={styles.friendAvatar}
                    />
                    <span className={styles.friendName}>{friend.name}</span>
                  </NavLink>
                ))}
              </div>
              <NavLink to="/amigos" className={styles.viewAllLink}>
                ver todos
              </NavLink>
            </div>

            {/* Comunidades */}
            <div className={styles.sidebarBox}>
              <h3 className={styles.sidebarTitle}>
                minhas comunidades ({communities.length})
              </h3>
              <div className={styles.communitiesList}>
                {communities.map((community) => (
                  <NavLink 
                    key={community._id} 
                    to={`/comunidades/${community._id}`}
                    className={styles.communityItem}
                  >
                    <img 
                      src={community.image || '/uploads/default-community.svg'}
                      alt={community.name}
                      className={styles.communityIcon}
                    />
                    <span className={styles.communityName}>{community.name}</span>
                  </NavLink>
                ))}
              </div>
              <NavLink to="/comunidades" className={styles.viewAllLink}>
                ver todas
              </NavLink>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default MainLayout; 