import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

import { api } from '../services/api';

interface User {
  userId: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber: string;
  role: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const clearAuthState = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
  }, []);

  const fetchUserProfile = useCallback(async (authToken: string) => {
    try {
      localStorage.setItem('authToken', authToken);
      const response = await api.get<{ success: boolean; user: any; message?: string }>('/settings/user/profile');
      
      if (response.success && response.user) {
        setUser(response.user);
      } else {
        clearAuthState();
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      clearAuthState();
    }
  }, [clearAuthState]);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('authToken');
      if (savedToken) {
        setToken(savedToken);
        await fetchUserProfile(savedToken);
      }
      setLoading(false);
    };

    initializeAuth();
  }, [fetchUserProfile]);

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; message: string }> => {
    try {
      setLoading(true);
      const response = await api.post<{ success: boolean; token: string; message: string }>('/login', credentials);

      if (response.success) {
        const authToken = response.token;
        setToken(authToken);
        localStorage.setItem('authToken', authToken);
        
        await fetchUserProfile(authToken);
        
        return { success: true, message: response.message || 'Login successful' };
      } else {
        return { success: false, message: response.message || 'Login failed' };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, message: error.message || 'Network error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthState();
    }
  };


  const isAuthenticated = !!token && !!user;

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
