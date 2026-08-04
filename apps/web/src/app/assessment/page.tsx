import Link from 'next/link';
import { AssessmentForm } from '../../components/AssessmentForm';

export default function AssessmentPage() {
  return (
    <div className="min-h-screen bg-ink-950 text-ink-50">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/startinde_logo.webp" alt="StartinDE" className="h-9 w-auto" />
        </Link>
        <Link href="/" className="text-sm text-ink-300 hover:text-gold-300">
          ← Back to home
        </Link>
      </header>

      <main className="py-10 pb-24">
        <AssessmentForm />
      </main>
    </div>
  );
}
