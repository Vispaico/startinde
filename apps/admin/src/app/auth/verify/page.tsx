'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AdminProvider, useAdmin } from '../../../components/AdminSession';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

function VerifyInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { signIn } = useAdmin();
  const token = params.get('token') ?? '';
  const email = params.get('email') ?? '';

  const [status, setStatus] = useState<'verifying' | 'ok' | 'forbidden' | 'error'>('verifying');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, email }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (data.ok && data.session && data.user) {
          if (!['staff', 'expert', 'admin'].includes(data.user.role)) {
            setStatus('forbidden');
            return;
          }
          signIn(data.session, data.user);
          setStatus('ok');
          setTimeout(() => router.push('/'), 900);
        } else {
          setError(data.error ?? 'Sign-in failed.');
          setStatus('error');
        }
      } catch {
        if (!cancelled) {
          setError('Could not reach the server.');
          setStatus('error');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, email, router, signIn]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink-950 px-6 text-center text-ink-50">
      {status === 'verifying' && <p className="font-display text-2xl font-semibold">Verifying…</p>}
      {status === 'ok' && (
        <p className="font-display text-2xl font-semibold text-gold-300">
          Welcome! Opening the console…
        </p>
      )}
      {status === 'forbidden' && (
        <>
          <p className="font-display text-2xl font-semibold text-red-300">Access denied</p>
          <p className="mt-3 max-w-md text-sm text-ink-300">
            Your account does not have staff or expert privileges. Contact an administrator.
          </p>
        </>
      )}
      {status === 'error' && (
        <>
          <p className="font-display text-2xl font-semibold text-red-300">Could not sign you in</p>
          <p className="mt-3 max-w-md text-sm text-ink-300">{error}</p>
        </>
      )}
    </div>
  );
}

export default function AdminVerifyPage() {
  return (
    <AdminProvider>
      <Suspense fallback={null}>
        <VerifyInner />
      </Suspense>
    </AdminProvider>
  );
}
