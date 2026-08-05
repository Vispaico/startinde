'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface SessionUser {
  id: string;
  email: string;
  role: string;
  locale: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = sessionStorage.getItem('startinde-session');
    if (!session) {
      setLoading(false);
      return;
    }
    fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${session}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setUser(data.user);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950 text-ink-300">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ink-950 px-6 text-center text-ink-50">
        <p className="font-display text-2xl font-semibold">You&apos;re not signed in</p>
        <Link
          href="/login"
          className="rounded-full bg-gold-500 px-8 py-3 font-semibold text-ink-950 hover:bg-gold-400"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-950 text-ink-50">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/startinde_logo.webp" alt="StartinDE" className="h-9 w-auto" />
        </Link>
        <button
          onClick={() => {
            sessionStorage.removeItem('startinde-session');
            window.location.href = '/';
          }}
          className="rounded-full border border-ink-500 px-4 py-1.5 text-sm text-ink-200 hover:border-gold-400 hover:text-gold-300"
        >
          Sign out
        </button>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10 pb-24">
        <p className="mb-2 text-sm text-ink-400">Welcome back,</p>
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">{user.email}</h1>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { t: 'My Pathway', d: 'Your assessment results and readiness score.', href: '/results', soon: false },
            { t: 'My Documents', d: 'Upload and check documents (coming soon).', href: '#', soon: true },
            { t: 'Ask StartinDE', d: 'The AI advisor, trained on official sources (coming soon).', href: '#', soon: true },
          ].map((card) => (
            <Link
              key={card.t}
              href={card.href}
              className="group rounded-2xl border border-ink-700/60 bg-ink-900/50 p-6 transition-colors hover:border-gold-500/60"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-ink-50 group-hover:text-gold-300">
                  {card.t}
                </h2>
                {card.soon && (
                  <span className="rounded-full bg-ink-800 px-2 py-0.5 text-[11px] text-ink-400">
                    soon
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-ink-300">{card.d}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
