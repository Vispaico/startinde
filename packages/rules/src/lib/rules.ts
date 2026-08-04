/**
 * Deterministic rules engine — AI explains rules, this code evaluates them.
 * Never a simple yes/no visa verdict: status is one of four states.
 */

export type RuleStatus = 'met' | 'not_met' | 'unknown' | 'review_required';

export interface RuleResult {
  status: RuleStatus;
  reason: string;
  evidence: string[];
  sourceIds: string[];
}

export function ok(reason: string, evidence: string[] = [], sourceIds: string[] = []): RuleResult {
  return { status: 'met', reason, evidence, sourceIds };
}

export function notMet(
  reason: string,
  evidence: string[] = [],
  sourceIds: string[] = [],
): RuleResult {
  return { status: 'not_met', reason, evidence, sourceIds };
}

export function unknown(
  reason: string,
  evidence: string[] = [],
  sourceIds: string[] = [],
): RuleResult {
  return { status: 'unknown', reason, evidence, sourceIds };
}

export function reviewRequired(
  reason: string,
  evidence: string[] = [],
  sourceIds: string[] = [],
): RuleResult {
  return { status: 'review_required', reason, evidence, sourceIds };
}

/**
 * Salary threshold check (e.g. EU Blue Card, skilled worker).
 * Missing salary ⇒ unknown, never a guess.
 */
export function evaluateSalaryRequirement(
  offeredSalary: number | null,
  requiredSalary: number,
  sourceIds: string[] = [],
): RuleResult {
  if (offeredSalary === null) {
    return {
      status: 'unknown',
      reason: 'No annual gross salary was provided.',
      evidence: [],
      sourceIds,
    };
  }
  return offeredSalary >= requiredSalary
    ? {
        status: 'met',
        reason: 'The stated salary meets the configured threshold.',
        evidence: [`Offered salary: €${offeredSalary}`],
        sourceIds,
      }
    : {
        status: 'not_met',
        reason: 'The stated salary is below the configured threshold.',
        evidence: [`Offered salary: €${offeredSalary}`],
        sourceIds,
      };
}

/**
 * Qualification recognition: whether a qualification was already recognised
 * in Germany (via ZAB/Anabin). "No data" ⇒ review_required — recognition is
 * a status that must be verified, not assumed.
 */
export function evaluateQualificationRecognition(
  hasRecognisedQualification: boolean | null,
  sourceIds: string[] = [],
): RuleResult {
  if (hasRecognisedQualification === null) {
    return {
      status: 'review_required',
      reason: 'Qualification recognition status is unknown and must be verified.',
      evidence: [],
      sourceIds,
    };
  }
  return hasRecognisedQualification
    ? {
        status: 'met',
        reason: 'Qualification is recorded as recognised.',
        evidence: ['Recognition status: recognised'],
        sourceIds,
      }
    : {
        status: 'not_met',
        reason: 'Qualification is not yet recognised; recognition must be initiated.',
        evidence: ['Recognition status: not recognised'],
        sourceIds,
      };
}

/**
 * German language level gate (e.g. A1 for family reunification, B1 for many
 * skilled paths). Unknown level ⇒ unknown.
 */
export function evaluateLanguageLevel(
  germanLevel: string | null,
  requiredLevel: string,
  sourceIds: string[] = [],
): RuleResult {
  const rank: Record<string, number> = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6, native: 7 };
  if (!germanLevel || !(germanLevel.toUpperCase() in rank)) {
    return {
      status: 'unknown',
      reason: 'German language level was not provided or is not recognised.',
      evidence: [],
      sourceIds,
    };
  }
  return rank[germanLevel.toUpperCase()] >= rank[requiredLevel]
    ? {
        status: 'met',
        reason: `German level (${germanLevel.toUpperCase()}) meets the required level (${requiredLevel}).`,
        evidence: [`German level: ${germanLevel.toUpperCase()}`],
        sourceIds,
      }
    : {
        status: 'not_met',
        reason: `German level (${germanLevel.toUpperCase()}) is below the required level (${requiredLevel}).`,
        evidence: [`German level: ${germanLevel.toUpperCase()}`],
        sourceIds,
      };
}

/** Combine several rule results into an overall pathway assessment. */
export function combineResults(
  results: RuleResult[],
  pathwayName: string,
): { status: RuleStatus; met: number; total: number; blockers: RuleResult[] } {
  const met = results.filter((r) => r.status === 'met').length;
  const blockers = results.filter(
    (r) => r.status === 'not_met' || r.status === 'review_required',
  );
  const total = results.length;
  const status: RuleStatus = blockers.length > 0 ? 'review_required' : met === total ? 'met' : 'unknown';
  return { status, met, total, blockers };
}
