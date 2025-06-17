import React from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './MainLayout.module.css';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
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
                <NavLink to="/" className={getNavLinkClass} end>Início</NavLink>
                <NavLink to={`/perfil/${user._id}`} className={getNavLinkClass}>Meu Perfil</NavLink>
                <NavLink to="/amigos" className={getNavLinkClass}>Amigos</NavLink>
                <NavLink to="/comunidades" className={getNavLinkClass}>Comunidades</NavLink>
              </nav>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{user.name}</span>
                <NavLink to={`/perfil/${user._id}`}>
                  <img 
                    src={user.profilePicture || '/uploads/default-avatar.svg'} 
                    alt="Meu Perfil" 
                    className={styles.navAvatar} 
                  />
                </NavLink>
                <button onClick={handleLogout} className={styles.logoutButton}>
                  (Sair)
                </button>
              </div>
            </div>
          )}
        </div>
      </header>
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout; 