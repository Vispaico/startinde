'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AdminProvider, adminFetch, useAdmin } from '../../../components/AdminSession';

interface ChangeDetail {
  id: string;
  old_content: string | null;
  new_content: string | null;
  classification: string | null;
  significance: string | null;
  ai_summary: string | null;
  affected_pathways: string[];
  affected_rules: string[];
  affected_pages: string[];
  affected_users: string[];
  suggested_update: string | null;
  status: string;
  url: string;
  title: string;
  authority: string;
  created_at: string;
}

function ReviewInner() {
  const params = useParams<{ id: string }>();
  const { token, loading, user } = useAdmin();
  const [change, setChange] = useState<ChangeDetail | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState(false);
  const [editedUpdate, setEditedUpdate] = useState('');

  const load = useCallback(() => {
    if (!token) return;
    adminFetch(`/api/admin/changes/${params.id}`, token)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok && data.change) {
          setChange(data.change);
          setEditedUpdate(data.change.suggested_update ?? '');
        } else {
          setError(data.error ?? 'Change not found.');
        }
      })
      .catch(() => setError('Could not load change.'));
  }, [token, params.id]);

  useEffect(() => {
    if (!loading && token) load();
  }, [loading, token, load]);

  async function decide(decision: string) {
    setBusy(true);
    setMessage('');
    try {
      const res = await adminFetch(`/api/admin/changes/${params.id}/decision`, token, {
        method: 'POST',
        body: JSON.stringify({
          decision,
          comment: message || undefined,
          editedUpdate: decision === 'edited' && editing ? editedUpdate : undefined,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setMessage(`Decision recorded: ${data.status}`);
        load();
      } else {
        setError(data.error ?? 'Decision failed.');
      }
    } catch {
      setError('Decision failed.');
    } finally {
      setBusy(false);
    }
  }

  async function publish() {
    setBusy(true);
    setMessage('');
    try {
      const res = await adminFetch(`/api/admin/changes/${params.id}/publish`, token, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.ok) {
        setMessage(`Published. Users will be notified of the change.`);
        load();
      } else {
        setError(data.error ?? 'Publish failed.');
      }
    } catch {
      setError('Publish failed.');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Centered>Loading…</Centered>;
  if (!user) return <Centered>Not signed in — <Link href="/login" className="text-gold-300 underline">sign in</Link></Centered>;

  return (
    <div className="min-h-screen bg-ink-950 text-ink-50">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="font-display text-xl font-semibold text-gold-400 hover:text-gold-300">
          StartinDE · Admin
        </Link>
        <Link href="/" className="text-sm text-ink-300 hover:text-gold-300">← All changes</Link>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24">
        {error && <p className="mb-4 rounded-xl border border-red-700 bg-red-900/30 px-4 py-3 text-sm text-red-200">{error}</p>}
        {message && <p className="mb-4 rounded-xl border border-emerald-700 bg-emerald-900/30 px-4 py-3 text-sm text-emerald-200">{message}</p>}

        {change && (
          <>
            <div className="mb-6">
              <p className="text-sm text-ink-400">{change.authority}</p>
              <h1 className="font-display text-3xl font-semibold">{change.title}</h1>
              <p className="mt-1 text-sm text-ink-400">
                <a href={change.url} target="_blank" rel="noreferrer" className="underline hover:text-gold-300">
                  {change.url}
                </a>
              </p>
            </div>

            {/* AI summary + significance */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2 rounded-2xl border border-ink-700/60 bg-ink-900/50 p-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gold-400">AI summary</p>
                <p className="text-sm text-ink-200">{change.ai_summary ?? 'No summary generated yet.'}</p>
              </div>
              <div className="rounded-2xl border border-ink-700/60 bg-ink-900/50 p-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gold-400">Significance</p>
                <p className={`text-2xl font-semibold ${
                  change.significance === 'critical' || change.significance === 'high' ? 'text-red-300' : 'text-ink-100'
                }`}>{change.significance ?? '—'}</p>
                <p className="mt-1 text-xs text-ink-400">classification: {change.classification ?? '—'}</p>
              </div>
            </div>

            {/* Old vs New */}
            <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-ink-700/60 bg-ink-900/50 p-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-red-300">Previous text</p>
                <pre className="max-h-72 overflow-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-ink-300">
                  {change.old_content ?? '(new page — no previous version)'}
                </pre>
              </div>
              <div className="rounded-2xl border border-ink-700/60 bg-ink-900/50 p-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-300">New text</p>
                <pre className="max-h-72 overflow-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-ink-200">
                  {change.new_content ?? '(removed — no new content)'}
                </pre>
              </div>
            </div>

            {/* Affected */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { label: 'Affected pathways', items: change.affected_pathways },
                { label: 'Affected rules', items: change.affected_rules },
                { label: 'Affected pages', items: change.affected_pages },
                { label: 'Affected users', items: change.affected_users },
              ].map((sec) => (
                <div key={sec.label} className="rounded-2xl border border-ink-700/60 bg-ink-900/50 p-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gold-400">{sec.label}</p>
                  {sec.items.length === 0 ? (
                    <p className="text-sm text-ink-500">None identified</p>
                  ) : (
                    <ul className="space-y-1 text-sm text-ink-200">
                      {sec.items.map((item, i) => <li key={i}>• {item}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            {/* Suggested update */}
            <div className="mb-6 rounded-2xl border border-ink-700/60 bg-ink-900/50 p-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gold-400">Suggested update</p>
              {editing ? (
                <textarea
                  value={editedUpdate}
                  onChange={(e) => setEditedUpdate(e.target.value)}
                  rows={5}
                  className="w-full rounded-xl border border-ink-600 bg-ink-900 px-4 py-3 text-sm text-ink-50 outline-none focus:border-gold-500"
                />
              ) : (
                <p className="text-sm text-ink-200">{change.suggested_update ?? 'None proposed yet.'}</p>
              )}
            </div>

            {/* Reviewer comment */}
            <div className="mb-6 rounded-2xl border border-ink-700/60 bg-ink-900/50 p-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gold-400">Reviewer comment</p>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
                placeholder="Optional note attached to the decision…"
                className="w-full rounded-xl border border-ink-600 bg-ink-900 px-4 py-3 text-sm text-ink-50 outline-none placeholder:text-ink-500 focus:border-gold-500"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => decide('approved')}
                disabled={busy || change.status === 'published'}
                className="rounded-full bg-emerald-600 px-6 py-2.5 font-semibold text-ink-950 hover:bg-emerald-500 disabled:opacity-40"
              >
                ✓ Approve
              </button>
              <button
                onClick={() => { setEditing(!editing); if (editing) decide('edited'); }}
                disabled={busy || change.status === 'published'}
                className="rounded-full border border-gold-500 px-6 py-2.5 font-semibold text-gold-300 hover:bg-gold-500/10 disabled:opacity-40"
              >
                {editing ? 'Save edited update' : '✎ Edit update'}
              </button>
              <button
                onClick={() => decide('rejected')}
                disabled={busy || change.status === 'published'}
                className="rounded-full border border-red-600 px-6 py-2.5 font-semibold text-red-300 hover:bg-red-500/10 disabled:opacity-40"
              >
                ✕ Reject
              </button>
              <button
                onClick={() => decide('assigned')}
                disabled={busy || change.status === 'published'}
                className="rounded-full border border-ink-500 px-6 py-2.5 font-semibold text-ink-200 hover:border-ink-300 disabled:opacity-40"
              >
                👤 Assign expert
              </button>
              <button
                onClick={publish}
                disabled={busy || change.status !== 'approved'}
                className="rounded-full bg-gold-500 px-6 py-2.5 font-semibold text-ink-950 hover:bg-gold-400 disabled:opacity-40"
              >
                🚀 Publish
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen items-center justify-center bg-ink-950 px-6 text-ink-50">{children}</div>;
}

export default function ReviewPage() {
  return (
    <AdminProvider>
      <ReviewInner />
    </AdminProvider>
  );
}
