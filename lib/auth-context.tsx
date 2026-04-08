'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi, type RegisterRequest } from './api/auth';
import { usersApi } from './api/users';
import type { UserResponse } from './api/types';

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserResponse | null;
  login: (login: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<{ email: string }>;
  confirmEmail: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserResponse | null>(null);

  // Called by the axios interceptor when refresh fails
  const forceLogout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  useEffect(() => {
    window.addEventListener('auth:expired', forceLogout);
    return () => window.removeEventListener('auth:expired', forceLogout);
  }, [forceLogout]);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      // getMe() will trigger the refresh interceptor if the token is expired
      const { data } = await usersApi.getMe();
      setUser(data);
      setIsAuthenticated(true);
    } catch {
      // Refresh also failed — interceptor already cleared tokens
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(loginVal: string, password: string) {
    const { data } = await authApi.login({ login: loginVal, password });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setIsAuthenticated(true);
    setUser(data.user);
  }

  async function register(registerData: RegisterRequest): Promise<{ email: string }> {
    const { data } = await authApi.register(registerData);
    return { email: data.email };
  }

  async function confirmEmail(email: string, code: string) {
    const { data } = await authApi.confirmEmail(email, code);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
    setIsAuthenticated(true);
  }

  async function logout() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) await authApi.logout(refreshToken);
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setIsAuthenticated(false);
      setUser(null);
    }
  }

  async function refreshUser() {
    try {
      const { data } = await usersApi.getMe();
      setUser(data);
    } catch {
      // ignore
    }
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        login,
        register,
        confirmEmail,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
