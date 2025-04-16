import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { isTokenExpired } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        
        if (token && !isTokenExpired(token)) {
          // 동적으로 authService 로드
          const { authService } = await import('../services/auth.service');
          const userData = await authService.getMe();
          setUser(userData);
        } else {
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            try {
              // 동적으로 authService 로드
              const { authService } = await import('../services/auth.service');
              const { accessToken } = await authService.refreshToken(refreshToken);
              localStorage.setItem('accessToken', accessToken);
              const userData = await authService.getMe();
              setUser(userData);
            } catch (error) {
              // 동적으로 authService 로드
              const { authService } = await import('../services/auth.service');
              authService.logout();
            }
          }
        }
      } catch (error) {
        console.error('인증 초기화 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // 동적으로 authService 로드
      const { authService } = await import('../services/auth.service');
      await authService.login(email, password);
      const userData = await authService.getMe();
      setUser(userData);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    // 동적으로 authService 로드
    const { authService } = await import('../services/auth.service');
    authService.logout();
    setUser(null);
  };

  const register = async (email: string, password: string) => {
    setLoading(true);
    try {
      // 동적으로 authService 로드
      const { authService } = await import('../services/auth.service');
      await authService.register({ email, password });
      await login(email, password);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth는 AuthProvider 내에서 사용해야 합니다');
  }
  return context;
}; 