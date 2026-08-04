'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const QUESTIONS = [
  { key: 'nationality', label: 'What is your nationality?', type: 'text', placeholder: 'e.g. Vietnam' },
  { key: 'countryOfResidence', label: 'Where do you currently live?', type: 'text', placeholder: 'e.g. Vietnam' },
  {
    key: 'highestQualification',
    label: 'What is your highest qualification?',
    type: 'select',
    options: ['High school', 'Bachelor’s degree', 'Master’s degree', 'PhD', 'Vocational training', 'Other'],
  },
  { key: 'profession', label: 'What is your profession?', type: 'text', placeholder: 'e.g. Software engineer' },
  {
    key: 'yearsOfExperience',
    label: 'How much work experience do you have?',
    type: 'select',
    options: ['None', 'Less than 2 years', '2–5 years', '5–10 years', 'More than 10 years'],
  },
  { key: 'hasJobOffer', label: 'Do you have a job offer from a German employer?', type: 'yesno' },
  { key: 'hasUniversityAdmission', label: 'Do you have university admission in Germany?', type: 'yesno' },
  { key: 'offeredSalary', label: 'What salary have you been offered (annual gross, EUR)?', type: 'number', placeholder: 'e.g. 52000' },
  {
    key: 'germanLevel',
    label: 'What is your German level?',
    type: 'select',
    options: ['None', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Native'],
  },
  { key: 'intendedArrivalDate', label: 'When do you want to move?', type: 'month' },
  { key: 'movingAlone', label: 'Are you moving alone or with family?', type: 'select', options: ['Alone', 'With family'] },
];

const GOAL_MAP: Record<string, string> = {
  study: 'study',
  work: 'work',
  bluecard: 'bluecard',
  job: 'job',
  ausbildung: 'ausbildung',
  vocational: 'ausbildung',
  poststudy: 'poststudy',
};

function AssessmentFormInner() {
  const router = useRouter();
  const params = useSearchParams();
  const goal = GOAL_MAP[params.get('goal') ?? ''] ?? 'study';

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const question = QUESTIONS[step];
  const total = QUESTIONS.length;
  const isLast = step === total - 1;

  function setAnswer(value: string) {
    setAnswers((prev) => ({ ...prev, [question.key]: value }));
  }

  async function next() {
    if (isLast) {
      setSubmitting(true);
      setError(null);
      try {
        const input = {
          goal,
          nationality: answers.nationality ?? '',
          countryOfResidence: answers.countryOfResidence ?? '',
          highestQualification: answers.highestQualification ?? '',
          profession: answers.profession ?? '',
          yearsOfExperience: toYears(answers.yearsOfExperience),
          hasJobOffer: answers.hasJobOffer === 'Yes',
          hasUniversityAdmission: answers.hasUniversityAdmission === 'Yes',
          offeredSalary: answers.offeredSalary ? Number(answers.offeredSalary) : null,
          germanLevel: answers.germanLevel === 'None' ? '' : (answers.germanLevel ?? ''),
          englishLevel: 'B1',
          intendedArrivalDate: answers.intendedArrivalDate ?? '',
          movingAlone: answers.movingAlone === 'Alone',
        };
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/assessment`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
          },
        );
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const data = await res.json();
        sessionStorage.setItem('startinde-result', JSON.stringify(data));
        router.push('/results');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong. Try again.');
        setSubmitting(false);
      }
    } else {
      setStep((s) => s + 1);
    }
  }

  function toYears(value: string | undefined): number {
    switch (value) {
      case 'None': return 0;
      case 'Less than 2 years': return 1;
      case '2–5 years': return 3;
      case '5–10 years': return 7;
      case 'More than 10 years': return 12;
      default: return 0;
    }
  }

  const canProceed =
    question.type === 'yesno'
      ? answers[question.key] !== undefined
      : question.type === 'select' || question.type === 'month'
        ? Boolean(answers[question.key])
        : true;

  return (
    <div className="mx-auto max-w-xl px-6">
      {/* Progress */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-sm text-ink-300">
          <span>Step {step + 1} of {total}</span>
          <span>{Math.round(((step + 1) / total) * 100)}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-800">
          <div
            className="h-full rounded-full bg-gold-500 transition-all duration-300"
            style={{ width: `${((step + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      <h1 className="font-display text-2xl font-semibold text-ink-50 sm:text-3xl">
        {question.label}
      </h1>
      <p className="mt-2 text-sm text-ink-400">
        {question.type === 'text' || question.type === 'number'
          ? 'Take your time — this helps us find the right path.'
          : 'Choose the closest option.'}
      </p>

      <div className="mt-8">
        {question.type === 'text' && (
          <input
            type="text"
            value={answers[question.key] ?? ''}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && next()}
            placeholder={question.placeholder}
            autoFocus
            className="w-full rounded-xl border border-ink-600 bg-ink-900 px-4 py-3 text-ink-50 outline-none placeholder:text-ink-500 focus:border-gold-500"
          />
        )}
        {question.type === 'number' && (
          <input
            type="number"
            value={answers[question.key] ?? ''}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && next()}
            placeholder={question.placeholder}
            autoFocus
            className="w-full rounded-xl border border-ink-600 bg-ink-900 px-4 py-3 text-ink-50 outline-none placeholder:text-ink-500 focus:border-gold-500"
          />
        )}
        {question.type === 'month' && (
          <input
            type="month"
            value={answers[question.key] ?? ''}
            onChange={(e) => setAnswer(e.target.value)}
            autoFocus
            className="w-full rounded-xl border border-ink-600 bg-ink-900 px-4 py-3 text-ink-50 outline-none focus:border-gold-500"
          />
        )}
        {question.type === 'select' && (
          <div className="grid grid-cols-1 gap-3">
            {question.options?.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  setAnswer(opt);
                  next();
                }}
                className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                  answers[question.key] === opt
                    ? 'border-gold-500 bg-gold-500/10 text-gold-300'
                    : 'border-ink-600 bg-ink-900 text-ink-100 hover:border-ink-400'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
        {question.type === 'yesno' && (
          <div className="grid grid-cols-2 gap-3">
            {['Yes', 'No'].map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  setAnswer(opt);
                  next();
                }}
                className={`rounded-xl border px-4 py-4 text-center transition-colors ${
                  answers[question.key] === opt
                    ? 'border-gold-500 bg-gold-500/10 text-gold-300'
                    : 'border-ink-600 bg-ink-900 text-ink-100 hover:border-ink-400'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="rounded-full px-5 py-2 text-sm font-medium text-ink-300 transition-colors hover:text-ink-50 disabled:opacity-40"
        >
          ← Back
        </button>
        {(question.type === 'text' || question.type === 'number' || question.type === 'month') && (
          <button
            onClick={next}
            disabled={submitting || !canProceed}
            className="rounded-full bg-gold-500 px-8 py-3 font-semibold text-ink-950 transition-colors hover:bg-gold-400 disabled:opacity-50"
          >
            {submitting ? 'Analysing…' : isLast ? 'See my results' : 'Next →'}
          </button>
        )}
      </div>

      {error && (
        <p className="mt-6 rounded-xl border border-red-700 bg-red-900/30 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}
    </div>
  );
}

export function AssessmentForm() {
  return (
    <Suspense fallback={null}>
      <AssessmentFormInner />
    </Suspense>
  );
}
