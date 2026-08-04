'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface RuleResult {
  status: 'met' | 'not_met' | 'unknown' | 'review_required';
  reason: string;
  evidence: string[];
  sourceIds: string[];
}

interface PathwayResult {
  pathway: string;
  slug: string;
  status: RuleResult['status'];
  readiness: { met: number; total: number };
  blockers: RuleResult[];
  ruleResults: RuleResult[];
  alternativePathway: string | null;
  nextAction: string;
}

interface AssessmentResponse {
  disclaimer: string;
  results: PathwayResult[];
}

const STATUS_LABEL: Record<RuleResult['status'], string> = {
  met: '✓ Met',
  not_met: '✗ Not met',
  unknown: '? Unknown',
  review_required: '△ Needs review',
};

const STATUS_COLOR: Record<RuleResult['status'], string> = {
  met: 'text-emerald-400',
  not_met: 'text-red-400',
  unknown: 'text-ink-300',
  review_required: 'text-gold-400',
};

function ReadinessMeter({ met, total }: { met: number; total: number }) {
  const pct = total > 0 ? Math.round((met / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="font-display text-5xl font-semibold text-gold-400">{pct}%</span>
        <span className="text-sm text-ink-300">
          {met} of {total} requirements completed
        </span>
      </div>
      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-ink-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-gold-600 to-gold-400 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const [data, setData] = useState<AssessmentResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = sessionStorage.getItem('startinde-result');
    if (raw) {
      try {
        setData(JSON.parse(raw));
      } catch {
        /* ignore */
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950 text-ink-300">
        Loading your results…
      </div>
    );
  }

  if (!data || data.results.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ink-950 px-6 text-center text-ink-300">
        <p>No results yet — take the assessment first.</p>
        <Link
          href="/assessment"
          className="rounded-full bg-gold-500 px-8 py-3 font-semibold text-ink-950 hover:bg-gold-400"
        >
          Start the assessment
        </Link>
      </div>
    );
  }

  const primary = data.results[0];
  const alternatives = data.results.slice(1);

  return (
    <div className="min-h-screen bg-ink-950 text-ink-50">
      <header className="mx-auto flex max-w-4xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/startinde_logo.webp" alt="StartinDE" className="h-9 w-auto" />
        </Link>
        <Link href="/assessment" className="text-sm text-ink-300 hover:text-gold-300">
          ← Retake assessment
        </Link>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10 pb-24">
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-gold-400">
          Your strongest pathway
        </p>
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">
          {primary.pathway}
        </h1>

        {/* Readiness */}
        <div className="mt-8 rounded-2xl border border-ink-700/60 bg-ink-900/60 p-8">
          <ReadinessMeter met={primary.readiness.met} total={primary.readiness.total} />
          {primary.nextAction && (
            <p className="mt-6 rounded-xl border border-gold-500/30 bg-gold-500/10 px-4 py-3 text-sm text-gold-200">
              <span className="font-semibold text-gold-300">Recommended next action:</span>{' '}
              {primary.nextAction}
            </p>
          )}
        </div>

        {/* Blockers */}
        {primary.blockers.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 text-lg font-semibold text-ink-100">
              Main unresolved items
            </h2>
            <ul className="space-y-3">
              {primary.blockers.map((b, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-ink-700/60 bg-ink-900/40 px-4 py-3 text-sm"
                >
                  <span className={STATUS_COLOR[b.status]}>{STATUS_LABEL[b.status]}</span>
                  <span className="text-ink-200">{b.reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Rule detail */}
        <div className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-ink-100">Requirement check</h2>
          <ul className="space-y-3">
            {primary.ruleResults.map((r, i) => (
              <li
                key={i}
                className="rounded-xl border border-ink-700/60 bg-ink-900/40 px-4 py-3 text-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className={STATUS_COLOR[r.status]}>{STATUS_LABEL[r.status]}</span>
                  <span className="text-ink-300">{r.sourceIds.join(', ') || '—'}</span>
                </div>
                <p className="mt-1 text-ink-200">{r.reason}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Alternatives */}
        {alternatives.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 text-lg font-semibold text-ink-100">
              Alternative pathways
            </h2>
            <div className="space-y-3">
              {alternatives.map((alt) => (
                <div
                  key={alt.slug}
                  className="flex items-center justify-between gap-3 rounded-xl border border-ink-700/60 bg-ink-900/40 px-4 py-3"
                >
                  <span className="font-medium text-ink-100">{alt.pathway}</span>
                  <span className="text-sm text-ink-300">
                    {alt.readiness.met}/{alt.readiness.total} requirements
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-12 rounded-2xl border border-ink-700/60 bg-ink-900/40 p-6">
          <p className="text-sm leading-relaxed text-ink-300">
            <span className="font-semibold text-ink-100">Important:</span> {data.disclaimer}{' '}
            Results are based on official sources (BAMF, Federal Foreign Office,
            DAAD, Make it in Germany) and are reviewed regularly. They are
            general information — not legal advice.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-10 rounded-2xl bg-gradient-to-br from-gold-500/20 to-ink-800 p-8 text-center">
          <h2 className="font-display text-xl font-semibold text-ink-50">
            Get your full Personal Germany Readiness Report
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-ink-300">
            Ranked pathways, personalised document checklist, timeline, risk
            indicators, and official citations — €29.
          </p>
          <button className="mt-6 rounded-full bg-gold-500 px-8 py-3 font-semibold text-ink-950 transition-colors hover:bg-gold-400">
            Get the full report
          </button>
          <p className="mt-4 text-xs text-ink-400">
            Coming soon — the free assessment results are yours to keep.
          </p>
        </div>
      </main>
    </div>
  );
}
