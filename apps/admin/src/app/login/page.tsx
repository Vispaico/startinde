'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminProvider } from '../../components/AdminSession';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

function LoginInner() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/magic-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus('sent');
      } else {
        setError(data.error ?? 'Something went wrong.');
        setStatus('error');
      }
    } catch {
      setError('Could not reach the server.');
      setStatus('error');
    }
  }

  void router;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink-950 px-6 text-ink-50">
      <h1 className="font-display text-3xl font-semibold">StartinDE Admin</h1>
      <p className="mt-2 text-ink-300">Operations — staff and experts only.</p>
      {status === 'sent' ? (
        <div className="mt-8 w-full max-w-md rounded-2xl border border-gold-500/30 bg-gold-500/10 p-6 text-center">
          <p className="font-semibold text-gold-300">Check your inbox 📬</p>
          <p className="mt-2 text-sm text-ink-200">
            Sign-in link sent to <strong>{email}</strong>. It expires in 15 minutes.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-8 w-full max-w-md">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@startin-de.com"
            autoFocus
            className="w-full rounded-xl border border-ink-600 bg-ink-900 px-4 py-3 text-ink-50 outline-none placeholder:text-ink-500 focus:border-gold-500"
          />
          {error && (
            <p className="mt-3 rounded-xl border border-red-700 bg-red-900/30 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={status === 'loading' || !email}
            className="mt-4 w-full rounded-full bg-gold-500 px-8 py-3 font-semibold text-ink-950 hover:bg-gold-400 disabled:opacity-50"
          >
            {status === 'loading' ? 'Sending…' : 'Email me the admin link'}
          </button>
        </form>
      )}
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <AdminProvider>
      <LoginInner />
    </AdminProvider>
  );
}
