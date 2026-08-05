import Link from 'next/link';
import { GoalSelector } from '../components/GoalSelector';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-ink-950 text-ink-50">
      {/* Header */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/startinde_logo.webp" alt="StartinDE" className="h-10 w-auto" />
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-ink-200 md:flex">
          <Link href="/study" className="hover:text-gold-300">Study</Link>
          <Link href="/work" className="hover:text-gold-300">Work</Link>
          <Link href="/ausbildung" className="hover:text-gold-300">Ausbildung</Link>
          <Link href="/living" className="hover:text-gold-300">Living in Germany</Link>
          <Link href="/services" className="hover:text-gold-300">Services</Link>
          <Link href="/login" className="hover:text-gold-300">Sign in</Link>
        </nav>
        <a
          href="/assessment"
          className="rounded-full bg-gold-500 px-5 py-2 text-sm font-semibold text-ink-950 transition-colors hover:bg-gold-400"
        >
          Start My Plan
        </a>
      </header>

      {/* Hero */}
      <main>
        <section className="mx-auto max-w-6xl px-6 pt-16 pb-20 text-center">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-ink-600/50 bg-ink-800/60 px-4 py-1.5 text-xs text-ink-200">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
            Based on official German sources · Last verified regularly
          </p>
          <h1 className="font-display mx-auto max-w-3xl text-4xl font-semibold leading-tight text-ink-50 sm:text-5xl lg:text-6xl">
            Build your personal path to Germany
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-ink-300">
            StartinDE combines official German information, personalised AI
            guidance, document readiness tools, and qualified human support to
            help you study, work, train, and settle in Germany.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="/assessment"
              className="rounded-full bg-gold-500 px-8 py-3 text-base font-semibold text-ink-950 transition-colors hover:bg-gold-400"
            >
              Take the free assessment
            </a>
            <a
              href="/services"
              className="rounded-full border border-ink-500 px-8 py-3 text-base font-semibold text-ink-100 transition-colors hover:border-gold-400 hover:text-gold-300"
            >
              Explore services
            </a>
          </div>
        </section>

        {/* Goal selector */}
        <section className="mx-auto max-w-6xl px-6 pb-24">
          <h2 className="font-display mb-8 text-center text-2xl font-semibold text-ink-100 sm:text-3xl">
            What do you want to do in Germany?
          </h2>
          <GoalSelector />
          <p className="mt-10 text-center text-sm text-ink-400">
            Based on the information supplied, results are indicative. The
            official authority makes the final determination.
          </p>
        </section>

        {/* Trust strip */}
        <section className="border-t border-ink-800 bg-ink-900/60 py-16">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="font-display mb-10 text-center text-2xl font-semibold text-ink-100">
              How StartinDE works
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { n: '01', t: 'Tell us about yourself', d: 'A 5-minute structured assessment builds your profile.' },
                { n: '02', t: 'See your pathways', d: 'Your strongest route, alternatives, and readiness score.' },
                { n: '03', t: 'Verify with official sources', d: 'Every answer cites BAMF, the AA, DAAD, or statutory law.' },
                { n: '04', t: 'Get help to act', d: 'Checklists, document readiness, and human experts.' },
              ].map((s) => (
                <div key={s.n} className="rounded-2xl border border-ink-700/60 bg-ink-800/40 p-6">
                  <span className="font-display text-3xl font-semibold text-gold-500">{s.n}</span>
                  <h3 className="mt-3 font-semibold text-ink-50">{s.t}</h3>
                  <p className="mt-2 text-sm text-ink-300">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-ink-400 sm:flex-row">
          <span>© {new Date().getFullYear()} StartinDE. All rights reserved.</span>
          <span className="max-w-md text-center sm:text-right">
            General information — not legal advice. The official authority makes
            the final determination.
          </span>
        </footer>
      </main>
    </div>
  );
}
