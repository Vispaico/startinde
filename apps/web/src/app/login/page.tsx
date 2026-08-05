'use client';

import { useState } from 'react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export default function LoginPage() {
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
      setError('Could not reach the server. Try again.');
      setStatus('error');
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-ink-950 text-ink-50">
      <header className="mx-auto flex w-full max-w-xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/startinde_logo.webp" alt="StartinDE" className="h-9 w-auto" />
        </Link>
        <Link href="/" className="text-sm text-ink-300 hover:text-gold-300">
          ← Back to home
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 pb-24">
        <h1 className="font-display text-3xl font-semibold">Sign in to StartinDE</h1>
        <p className="mt-3 text-ink-300">
          We&apos;ll email you a secure sign-in link. No password needed.
        </p>

        {status === 'sent' ? (
          <div className="mt-8 rounded-2xl border border-gold-500/30 bg-gold-500/10 p-6">
            <p className="font-semibold text-gold-300">Check your inbox 📬</p>
            <p className="mt-2 text-sm text-ink-200">
              We sent a sign-in link to <strong>{email}</strong>. The link expires
              in 15 minutes.
            </p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-4 text-sm text-ink-300 underline hover:text-gold-300"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-8">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
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
              className="mt-4 w-full rounded-full bg-gold-500 px-8 py-3 font-semibold text-ink-950 transition-colors hover:bg-gold-400 disabled:opacity-50"
            >
              {status === 'loading' ? 'Sending…' : 'Email me the sign-in link'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
