'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types/api';
import { authService } from '@/services/authService';

export interface AuthUser {
  userId: number
  username: string
  role: 'miner'|'admin'
  roleId:number
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        console.log('Current user:', currentUser);
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to get current user:', error);
        // Only logout if there's a specific authentication error
        // Don't automatically logout for all errors
        if (error instanceof Error && error.message.includes('auth') ) {
          authService.logout();
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const result = await authService.login({ email, password });
      // After successful login, get the updated user
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Login failed:', error);
      throw error; // Re-throw to let the component handle it
    }
  };

  const register = async (data: any) => {
    try {
      const result = await authService.register(data);
      // After successful registration, get the updated user
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error; // Re-throw to let the component handle it
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Optional: Create a separate hook for when you definitely need a user
export const useRequiredAuth = () => {
  const context = useAuth();
  if (!context.user) {
    throw new Error('useRequiredAuth must be used when user is authenticated');
  }
  return context as AuthContextType & { user: AuthUser };
};