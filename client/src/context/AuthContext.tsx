import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types/index.js';
import { api } from '../services/api.js';
import { StorageService } from '../services/storage.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  updatePreferences: (prefs: Partial<User['preferences']>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initAuth() {
      try {
        const storedToken = await StorageService.getToken();
        if (storedToken) {
          setToken(storedToken);
          const { user: fetchedUser } = await api.auth.getMe();
          setUser(fetchedUser);
          await StorageService.setUser(fetchedUser);
        }
      } catch (err) {
        console.warn('[Aswora Auth] Session restoration failed:', err);
        await StorageService.removeToken();
        await StorageService.removeUser();
      } finally {
        setIsLoading(false);
      }
    }
    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const data = await api.auth.login({ email, password: pass });
      setToken(data.token);
      setUser(data.user);
      await StorageService.setToken(data.token);
      await StorageService.setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, pass: string) => {
    setIsLoading(true);
    try {
      const data = await api.auth.register({ name, email, password: pass });
      setToken(data.token);
      setUser(data.user);
      await StorageService.setToken(data.token);
      await StorageService.setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.auth.logout();
    } finally {
      setToken(null);
      setUser(null);
      setIsLoading(false);
    }
  };

  const updatePreferences = async (prefs: Partial<User['preferences']>) => {
    const data = await api.auth.updatePreferences(prefs);
    if (user) {
      const updatedUser = { ...user, preferences: data.preferences };
      setUser(updatedUser);
      await StorageService.setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        register,
        logout,
        updatePreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
