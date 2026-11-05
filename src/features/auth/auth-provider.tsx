'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ApiError, apiRequest } from '@/lib/api';

const storageKey = 'colcomex-session';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

interface Session {
  token: string;
  user: AuthUser;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  restoreSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const restoreSession = useCallback(async () => {
    const savedToken = localStorage.getItem(storageKey);
    if (!savedToken) {
      setSession(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await apiRequest<{ data: AuthUser }>('/api/auth/me', { token: savedToken });
      setSession({ token: savedToken, user: result.data });
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        localStorage.removeItem(storageKey);
        setSession(null);
        setError('Tu sesión venció. Inicia sesión de nuevo.');
      } else {
        setSession(null);
        setError(requestError instanceof Error
          ? `No se pudo verificar la sesión: ${requestError.message}`
          : 'No se pudo verificar la sesión. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) return restoreSession();
    });
    return () => {
      active = false;
    };
  }, [restoreSession]);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    const result = await apiRequest<{ data: Session }>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    localStorage.setItem(storageKey, result.data.token);
    setSession(result.data);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setError(null);
    await apiRequest<{ data: AuthUser }>('/api/auth/register', {
      method: 'POST',
      body: { name, email, password },
    });
    await login(email, password);
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem(storageKey);
    setSession(null);
    setError(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user: session?.user ?? null,
    token: session?.token ?? null,
    loading,
    error,
    login,
    register,
    logout,
    restoreSession,
  }), [session, loading, error, login, register, logout, restoreSession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth debe usarse dentro de AuthProvider.');
  return value;
}
