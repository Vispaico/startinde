'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

function VerifyInner() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const email = params.get('email') ?? '';

  const [status, setStatus] = useState<'verifying' | 'ok' | 'error'>('verifying');
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
        if (data.ok && data.session) {
          sessionStorage.setItem('startinde-session', data.session);
          setStatus('ok');
          setTimeout(() => router.push('/dashboard'), 900);
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
  }, [token, email, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink-950 px-6 text-center text-ink-50">
      <Link href="/" className="mb-8 flex items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/startinde_logo.webp" alt="StartinDE" className="h-10 w-auto" />
      </Link>
      {status === 'verifying' && (
        <>
          <p className="font-display text-2xl font-semibold">Signing you in…</p>
          <div className="mt-6 h-1.5 w-48 overflow-hidden rounded-full bg-ink-800">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-gold-500" />
          </div>
        </>
      )}
      {status === 'ok' && (
        <p className="font-display text-2xl font-semibold text-gold-300">
          Welcome! Taking you to your dashboard…
        </p>
      )}
      {status === 'error' && (
        <>
          <p className="font-display text-2xl font-semibold text-red-300">
            Could not sign you in
          </p>
          <p className="mt-3 max-w-md text-sm text-ink-300">{error}</p>
          <Link
            href="/login"
            className="mt-6 rounded-full bg-gold-500 px-8 py-3 font-semibold text-ink-950 hover:bg-gold-400"
          >
            Request a new link
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyInner />
    </Suspense>
  );
}
