import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import type { User, Role } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('es_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return localStorage.getItem('es_token');
  });

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4042/api/v1'}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Backend returns data directly as { role, name, accessToken, ... }
      const userData: User = {
        id: data.role + '-' + Date.now(), // Fallback ID for UI
        name: data.name,
        email: email,
        role: data.role as Role,
        jobRole: data.jobRole || undefined,
        branch: data.branch || undefined,
        avatar: data.avatar || undefined
      };

      setUser(userData);
      setAccessToken(data.accessToken);
      localStorage.setItem('es_user', JSON.stringify(userData));
      localStorage.setItem('es_token', data.accessToken);
      localStorage.setItem('es_auth', 'true');
      return userData;
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to login');
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (accessToken) {
        await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4042/api/v1'}/admin/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          credentials: 'include',
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('es_user');
      localStorage.removeItem('es_token');
      localStorage.removeItem('es_auth');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
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
