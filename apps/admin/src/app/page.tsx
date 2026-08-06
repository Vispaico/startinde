'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminProvider, adminFetch, useAdmin } from '../components/AdminSession';

interface ChangeRow {
  id: string;
  classification: string;
  significance: string;
  status: string;
  created_at: string;
  ai_summary: string | null;
  url: string;
  title: string;
  authority: string;
}

const STATUS_COLORS: Record<string, string> = {
  detected: 'text-ink-300 bg-ink-800',
  review: 'text-gold-300 bg-gold-500/10',
  approved: 'text-emerald-300 bg-emerald-500/10',
  rejected: 'text-red-300 bg-red-500/10',
  published: 'text-ink-200 bg-ink-700/50',
};

const CLASS_COLORS: Record<string, string> = {
  cosmetic: 'text-ink-400',
  informational: 'text-ink-300',
  procedural: 'text-sky-300',
  financial: 'text-gold-300',
  legal: 'text-violet-300',
  urgent: 'text-red-300',
};

function DashboardInner() {
  const { user, loading, token, signOut } = useAdmin();
  const [changes, setChanges] = useState<ChangeRow[]>([]);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || loading) return;
    adminFetch(`/api/admin/changes?status=${filter}`, token)
      .then((r) => r.json())
      .then((data) => {
        if (data.changes) setChanges(data.changes);
        else if (data.error) setError(data.error);
      })
      .catch(() => setError('Could not load changes.'));
  }, [token, loading, filter]);

  if (loading) {
    return <Shell loading />;
  }

  if (!user) {
    return (
      <Shell>
        <div className="mx-auto max-w-md text-center">
          <p className="font-display text-2xl font-semibold">You&apos;re not signed in</p>
          <Link href="/login" className="mt-6 inline-block rounded-full bg-gold-500 px-8 py-3 font-semibold text-ink-950 hover:bg-gold-400">
            Sign in
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-ink-400">Signed in as {user.email}</p>
          <h1 className="font-display text-3xl font-semibold">Detected Changes</h1>
        </div>
        <button
          onClick={signOut}
          className="rounded-full border border-ink-500 px-4 py-1.5 text-sm text-ink-200 hover:border-gold-400 hover:text-gold-300"
        >
          Sign out
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {['all', 'detected', 'review', 'approved', 'rejected', 'published'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-1.5 text-sm capitalize transition-colors ${
              filter === s ? 'bg-gold-500 text-ink-950' : 'border border-ink-600 text-ink-300 hover:border-ink-400'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {error && <p className="mb-4 rounded-xl border border-red-700 bg-red-900/30 px-4 py-3 text-sm text-red-200">{error}</p>}

      {changes.length === 0 ? (
        <div className="rounded-2xl border border-ink-700/60 bg-ink-900/40 p-10 text-center text-ink-400">
          No changes in this view yet. The knowledge engine will populate this
          queue when official sources change.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-700/60">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-700/60 bg-ink-900/80 text-left text-xs uppercase tracking-wider text-ink-400">
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Classification</th>
                <th className="px-4 py-3">Significance</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Detected</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {changes.map((c) => (
                <tr key={c.id} className="border-b border-ink-800/60 hover:bg-ink-900/60">
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink-100">{c.authority}</div>
                    <div className="max-w-[280px] truncate text-xs text-ink-400">{c.url}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={CLASS_COLORS[c.classification] ?? 'text-ink-300'}>{c.classification}</span>
                  </td>
                  <td className="px-4 py-3 text-ink-200">{c.significance}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs ${STATUS_COLORS[c.status] ?? ''}`}>{c.status}</span>
                  </td>
                  <td className="px-4 py-3 text-ink-400">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/changes/${c.id}`}
                      className="rounded-full bg-gold-500/15 px-4 py-1.5 text-xs font-semibold text-gold-300 hover:bg-gold-500/25"
                    >
                      Review →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Shell>
  );
}

function Shell({ children, loading }: { children?: React.ReactNode; loading?: boolean }) {
  return (
    <div className="min-h-screen bg-ink-950 text-ink-50">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <span className="font-display text-xl font-semibold text-gold-400">StartinDE · Admin</span>
        <span className="text-xs text-ink-400">admin.startin-de.com</span>
      </header>
      <main className="mx-auto max-w-6xl px-6 pb-24">
        {loading ? <p className="py-16 text-center text-ink-400">Loading…</p> : children}
      </main>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <AdminProvider>
      <DashboardInner />
    </AdminProvider>
  );
}
