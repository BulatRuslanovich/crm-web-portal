'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
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

  const forceLogout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  useEffect(() => {
    window.addEventListener('auth:expired', forceLogout);
    return () => window.removeEventListener('auth:expired', forceLogout);
  }, [forceLogout]);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        const { data } = await usersApi.getMe();
        setUser(data);
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (loginVal: string, password: string) => {
    const { data } = await authApi.login({ login: loginVal, password });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setIsAuthenticated(true);
    setUser(data.user);
  }, []);

  const register = useCallback(
    async (registerData: RegisterRequest): Promise<{ email: string }> => {
      const { data } = await authApi.register(registerData);
      return { email: data.email };
    },
    [],
  );

  const confirmEmail = useCallback(async (email: string, code: string) => {
    const { data } = await authApi.confirmEmail(email, code);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(async () => {
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
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await usersApi.getMe();
      setUser(data);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      isLoading,
      user,
      login,
      register,
      confirmEmail,
      logout,
      refreshUser,
    }),
    [isAuthenticated, isLoading, user, login, register, confirmEmail, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
