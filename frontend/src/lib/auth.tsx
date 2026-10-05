import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, ApiResponse } from '../types';
import api from './axios';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (user: User, accessToken?: string, refreshToken?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (user) {
        try {
          // Verify session via /api/auth/me (Axios interceptor handles refresh automatically if expired)
          const { data } = await api.get<ApiResponse<{ user: User }>>('/api/auth/me');
          if (data.success && data.data?.user && data.data.user.role === 'ADMIN') {
            setUser(data.data.user);
            localStorage.setItem('admin_user', JSON.stringify(data.data.user));
          } else {
            throw new Error('Not admin');
          }
        } catch (error) {
          setUser(null);
          localStorage.removeItem('admin_user');
          localStorage.removeItem('admin_access_token');
          localStorage.removeItem('admin_refresh_token');
          delete api.defaults.headers.common['Authorization'];
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = (newUser: User, accessToken?: string, refreshToken?: string) => {
    if (accessToken) {
      localStorage.setItem('admin_access_token', accessToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    }
    if (refreshToken) {
      localStorage.setItem('admin_refresh_token', refreshToken);
    }
    setUser(newUser);
    localStorage.setItem('admin_user', JSON.stringify(newUser));
  };

  const logout = async () => {
    try {
      const storedRefreshToken = localStorage.getItem('admin_refresh_token');
      await api.post('/api/auth/logout', { refreshToken: storedRefreshToken || undefined });
    } catch (e) {}
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
