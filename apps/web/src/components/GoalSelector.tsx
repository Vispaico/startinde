'use client';

import { useRouter } from 'next/navigation';

const GOALS = [
  { key: 'study', label: 'Study in Germany', emoji: '🎓', desc: 'Master’s, Bachelor’s, PhD' },
  { key: 'work', label: 'Work in Germany', emoji: '💼', desc: 'Blue Card, skilled worker, job search' },
  { key: 'ausbildung', label: 'Find an Ausbildung', emoji: '🛠️', desc: 'Vocational training with pay' },
  { key: 'job', label: 'Search for a job', emoji: '🔎', desc: 'Job seeker and Opportunity Card' },
  { key: 'family', label: 'Join family', emoji: '👨‍👩‍👧', desc: 'Family reunification' },
  { key: 'business', label: 'Start a business', emoji: '🚀', desc: 'Freelance and entrepreneurship' },
  { key: 'move', label: 'Move to Germany', emoji: '🇩🇪', desc: 'Relocation and settlement' },
  { key: 'situation', label: 'Check my current situation', emoji: '🧭', desc: 'Existing residence status' },
];

export function GoalSelector() {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {GOALS.map((goal) => (
        <button
          key={goal.key}
          onClick={() => router.push(`/assessment?goal=${goal.key}`)}
          className="group flex flex-col items-start gap-3 rounded-2xl border border-ink-700/60 bg-ink-800/50 p-6 text-left transition-all hover:border-gold-500/70 hover:bg-ink-800 hover:shadow-xl"
        >
          <span className="text-3xl" aria-hidden>
            {goal.emoji}
          </span>
          <span className="font-display text-lg font-semibold text-ink-50 group-hover:text-gold-300">
            {goal.label}
          </span>
          <span className="text-sm text-ink-300">{goal.desc}</span>
        </button>
      ))}
    </div>
  );
}
