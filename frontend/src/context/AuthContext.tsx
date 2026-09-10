import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../services/api';
import { registerAndSubscribePush } from '../services/webPushService';

interface User {
  id: string;
  username: string;
  email?: string;
  displayName?: string;
  createdAt?: string;
  gender?: string;
  avatar?: string;
  themeColor?: string;
  notificationsEnabled?: boolean;
  customStatusText?: string;
  bio?: string;
  statusEmoji?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  register: (username: string, email: string, displayName: string, password: string, gender: string, avatar: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateSettings: (themeColor?: string, notificationsEnabled?: boolean) => Promise<void>;
  updateProfile: (data: { gender?: string; avatar?: string; bio?: string; statusEmoji?: string; customStatusText?: string }) => Promise<void>;
  privateKey: CryptoKey | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [privateKey, setPrivateKey] = useState<CryptoKey | null>(null);

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
          
          if (response.data.notificationsEnabled !== false) {
             registerAndSubscribePush().catch(console.error);
          }
          
          import('../services/cryptoService').then(({ cryptoService }) => {
            const storedKey = sessionStorage.getItem('e2ee_private_key');
            if (storedKey) {
              cryptoService.importPrivateKey(storedKey).then(pk => setPrivateKey(pk)).catch(console.error);
            }
          });
        } catch (err: any) {
          console.error("Token validation failed. Logging out.", err);
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          sessionStorage.removeItem('e2ee_private_key');
          setUser(null);
          setToken(null);
          setPrivateKey(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (emailOrUsername: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/auth/login', { username: emailOrUsername, password });
      const { token: receivedToken, userId, username: resUsername, gender, avatar, themeColor, notificationsEnabled, publicKey, encryptedPrivateKey } = response.data;
      
      localStorage.setItem('token', receivedToken);
      localStorage.setItem('username', resUsername);
      if (gender) localStorage.setItem('user-gender', gender);
      if (avatar) localStorage.setItem('user-avatar', avatar);
      setToken(receivedToken);
      setUser({ id: userId, username: resUsername, gender, avatar, themeColor, notificationsEnabled });
      if (themeColor) document.documentElement.setAttribute('data-theme', themeColor);
      
      const { cryptoService } = await import('../services/cryptoService');
      let privKey: CryptoKey;
      if (publicKey && encryptedPrivateKey) {
        const wrappingKey = await cryptoService.deriveWrappingKey(password, resUsername);
        privKey = await cryptoService.unwrapPrivateKey(encryptedPrivateKey, wrappingKey);
      } else {
        const keyPair = await cryptoService.generateKeyPair();
        const pubKeyBase64 = await cryptoService.exportPublicKey(keyPair.publicKey);
        const wrappingKey = await cryptoService.deriveWrappingKey(password, resUsername);
        const encryptedPrivKeyBase64 = await cryptoService.wrapPrivateKey(keyPair.privateKey, wrappingKey);
        await api.post('/api/crypto/keys', {
          publicKey: pubKeyBase64,
          encryptedPrivateKey: encryptedPrivKeyBase64
        }, { headers: { Authorization: `Bearer ${receivedToken}` } });
        privKey = keyPair.privateKey;
      }
      setPrivateKey(privKey);
      sessionStorage.setItem('e2ee_private_key', await cryptoService.exportPrivateKey(privKey));
      
      if (notificationsEnabled !== false) {
        registerAndSubscribePush().catch(console.error);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, displayName: string, password: string, gender: string, avatar: string) => {
    setLoading(true);
    setError(null);
    try {
      const { cryptoService } = await import('../services/cryptoService');
      const keyPair = await cryptoService.generateKeyPair();
      const pubKeyBase64 = await cryptoService.exportPublicKey(keyPair.publicKey);
      const wrappingKey = await cryptoService.deriveWrappingKey(password, username);
      const encryptedPrivKeyBase64 = await cryptoService.wrapPrivateKey(keyPair.privateKey, wrappingKey);

      const response = await api.post('/api/auth/register', { 
        username, email, displayName, password, gender, avatar,
        publicKey: pubKeyBase64,
        encryptedPrivateKey: encryptedPrivKeyBase64
      });
      const { token: receivedToken, userId, username: resUsername, themeColor, notificationsEnabled } = response.data;
      
      localStorage.setItem('token', receivedToken);
      localStorage.setItem('username', resUsername);
      localStorage.setItem('user-gender', gender);
      localStorage.setItem('user-avatar', avatar);
      setToken(receivedToken);
      setUser({ id: userId, username: resUsername, gender, avatar, themeColor, notificationsEnabled });
      if (themeColor) document.documentElement.setAttribute('data-theme', themeColor);
      
      setPrivateKey(keyPair.privateKey);
      sessionStorage.setItem('e2ee_private_key', await cryptoService.exportPrivateKey(keyPair.privateKey));
      
      if (notificationsEnabled !== false) {
        registerAndSubscribePush().catch(console.error);
      }
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
    sessionStorage.removeItem('e2ee_private_key');
    setToken(null);
    setUser(null);
    setPrivateKey(null);
    setError(null);
    // Unsubscribe from web push logic could be called here via API if desired
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
      if (notificationsEnabled === true) {
        registerAndSubscribePush().catch(console.error);
      }
    } catch (err) {
      console.error("Failed to update settings", err);
      throw err;
    }
  };

  const updateProfile = async (data: { gender?: string; avatar?: string; bio?: string; statusEmoji?: string; customStatusText?: string }) => {
    try {
      const response = await api.put('/api/users/profile', data);
      setUser(prev => prev ? { 
        ...prev, 
        gender: response.data.gender, 
        avatar: response.data.avatar,
        bio: response.data.bio,
        statusEmoji: response.data.statusEmoji,
        customStatusText: response.data.customStatusText
      } : response.data);
      if (response.data.gender) localStorage.setItem('user-gender', response.data.gender);
      if (response.data.avatar) localStorage.setItem('user-avatar', response.data.avatar);
    } catch (err) {
      console.error("Failed to update profile", err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, logout, clearError, updateSettings, updateProfile, privateKey }}>
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
