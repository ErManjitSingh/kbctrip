'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, clearToken, getToken, setToken } from '@/lib/api';
import type { AuthUser } from '@/lib/types';

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  apiOnline: boolean | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const requirePlatformAdmin = (user: AuthUser): AuthUser => {
  if (user.role !== 'super_admin') {
    clearToken();
    throw new Error('This console is for platform administrators only (super_admin).');
  }
  return user;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    const boot = async () => {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_KBC_BOOKING_API_URL ?? 'http://localhost:4000/api'}/health`, {
          cache: 'no-store',
        });
        if (!cancelled) setApiOnline(true);
      } catch {
        if (!cancelled) setApiOnline(false);
      }

      if (!getToken()) {
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const me = requirePlatformAdmin(await api.get<AuthUser>('/auth/me'));
        if (!cancelled) setUser(me);
      } catch {
        clearToken();
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void boot();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.post<{ accessToken: string; user: AuthUser }>('/auth/login', {
      email,
      password,
    });
    setToken(data.accessToken);
    try {
      setUser(requirePlatformAdmin(await api.get<AuthUser>('/auth/me')));
      setApiOnline(true);
    } catch (err) {
      clearToken();
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    window.location.href = '/login';
  }, []);

  const value = useMemo(
    () => ({ user, loading, apiOnline, login, logout }),
    [user, loading, apiOnline, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
