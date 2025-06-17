import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('orkut-user');
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      localStorage.removeItem('orkut-user');
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  const login = (userData) => {
    try {
      localStorage.setItem('orkut-user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Erro ao salvar dados do usuário:', error);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('orkut-user');
      setUser(null);
    } catch (error) {
      console.error('Erro ao limpar dados do usuário:', error);
    }
  };

  const refreshUser = async () => {
    if (!user?.token || !user?._id) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${user._id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      
      if (response.ok) {
        const freshData = await response.json();
        const updatedUser = { ...user, ...freshData };
        
        localStorage.setItem('orkut-user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      } else if (response.status === 401) {
        // Token expirado ou inválido
        console.warn('Token expirado, fazendo logout...');
        logout();
      } else {
        console.error('Erro ao atualizar dados do usuário:', response.status);
      }
    } catch (error) {
      console.error('Erro na requisição de atualização:', error);
      // Não fazer logout em caso de erro de rede
    } finally {
      setIsLoading(false);
    }
  };

  // Atualização automática dos dados do usuário a cada 5 minutos
  useEffect(() => {
    if (user?.token) {
      const interval = setInterval(refreshUser, 5 * 60 * 1000); // 5 minutos
      return () => clearInterval(interval);
    }
  }, [user?.token]);

  const value = {
    user,
    isAuthenticated: !!user?.token,
    token: user?.token || null,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}; 