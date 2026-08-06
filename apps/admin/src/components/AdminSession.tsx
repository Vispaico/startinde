'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
const SESSION_KEY = 'startinde-admin-session';

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  locale: string;
}

interface AdminSession {
  user: AdminUser | null;
  loading: boolean;
  token: string | null;
  signIn: (token: string, user: AdminUser) => void;
  signOut: () => void;
}

const AdminContext = createContext<AdminSession>({
  user: null,
  loading: true,
  token: null,
  signIn: () => {},
  signOut: () => {},
});

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = sessionStorage.getItem(SESSION_KEY);
    if (!t) {
      setLoading(false);
      return;
    }
    setToken(t);
    fetch(`${API_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${t}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok && data.user) {
          setUser(data.user);
        } else {
          sessionStorage.removeItem(SESSION_KEY);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function signIn(t: string, u: AdminUser) {
    sessionStorage.setItem(SESSION_KEY, t);
    setToken(t);
    setUser(u);
  }

  function signOut() {
    sessionStorage.removeItem(SESSION_KEY);
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  }

  return (
    <AdminContext.Provider value={{ user, loading, token, signIn, signOut }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}

export function adminFetch(path: string, token: string | null, init?: RequestInit) {
  return fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
}
