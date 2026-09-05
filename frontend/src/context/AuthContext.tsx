import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../services/api';

interface User {
  id: string;
  username: string;
  createdAt?: string;
  gender?: string;
  avatar?: string;
  themeColor?: string;
  notificationsEnabled?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, gender: string, avatar: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateSettings: (themeColor?: string, notificationsEnabled?: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const response = await api.get('/api/auth/me');
          setUser(response.data);
          localStorage.setItem('username', response.data.username);
          if (response.data.gender) localStorage.setItem('user-gender', response.data.gender);
          if (response.data.avatar) localStorage.setItem('user-avatar', response.data.avatar);
          if (response.data.themeColor) document.documentElement.setAttribute('data-theme', response.data.themeColor);
          setToken(storedToken);
        } catch (err: any) {
          console.error("Token validation failed. Logging out.", err);
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/auth/login', { username, password });
      const { token: receivedToken, userId, username: resUsername, gender, avatar, themeColor, notificationsEnabled } = response.data;
      
      localStorage.setItem('token', receivedToken);
      localStorage.setItem('username', resUsername);
      if (gender) localStorage.setItem('user-gender', gender);
      if (avatar) localStorage.setItem('user-avatar', avatar);
      setToken(receivedToken);
      setUser({ id: userId, username: resUsername, gender, avatar, themeColor, notificationsEnabled });
      if (themeColor) document.documentElement.setAttribute('data-theme', themeColor);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, password: string, gender: string, avatar: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/auth/register', { username, password, gender, avatar });
      const { token: receivedToken, userId, username: resUsername, themeColor, notificationsEnabled } = response.data;
      
      localStorage.setItem('token', receivedToken);
      localStorage.setItem('username', resUsername);
      localStorage.setItem('user-gender', gender);
      localStorage.setItem('user-avatar', avatar);
      setToken(receivedToken);
      setUser({ id: userId, username: resUsername, gender, avatar, themeColor, notificationsEnabled });
      if (themeColor) document.documentElement.setAttribute('data-theme', themeColor);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Username might be taken.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUser(null);
    setError(null);
  };

  const clearError = () => setError(null);

  const updateSettings = async (themeColor?: string, notificationsEnabled?: boolean) => {
    try {
      const payload: any = {};
      if (themeColor !== undefined) payload.themeColor = themeColor;
      if (notificationsEnabled !== undefined) payload.notificationsEnabled = notificationsEnabled;
      
      const response = await api.put('/api/auth/settings', payload);
      setUser(response.data);
      if (response.data.themeColor) {
        document.documentElement.setAttribute('data-theme', response.data.themeColor);
      }
    } catch (err) {
      console.error("Failed to update settings", err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, logout, clearError, updateSettings }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
