/**
 * Document intelligence — uploads, extraction, findings.
 * Privacy-first: minimum data to AI, per-user isolation, retention.
 */

export type DocumentStatus = 'uploaded' | 'processing' | 'ready' | 'review_required' | 'rejected';

export type FindingSeverity = 'info' | 'warning' | 'blocker';

export interface DocumentRecord {
  id: string;
  userId: string;
  caseId: string | null;
  docType: string;
  storageKey: string;
  originalName: string;
  mimeType: string | null;
  sizeBytes: number | null;
  status: DocumentStatus;
  consentGiven: boolean;
  retentionUntil: string | null;
  createdAt: string;
  deletedAt: string | null;
}

export interface DocumentFinding {
  type: string;
  severity: FindingSeverity;
  message: string;
  recommendedAction: string;
}

export interface ReadinessReport {
  documentId: string;
  status: DocumentStatus;
  findings: DocumentFinding[];
  /** readiness display: e.g. 8 of 12 requirements */
  readyCount: number;
  totalChecks: number;
  generatedAt: string;
}

/** Standard doc types supported by the checker. */
export const SUPPORTED_DOC_TYPES = [
  'passport',
  'degree_certificate',
  'transcript',
  'employment_contract',
  'university_admission',
  'proof_of_funds',
  'language_certificate',
  'cv',
  'employment_reference',
  'recognition_statement',
  'health_insurance',
  'application_form',
] as const;

export type SupportedDocType = (typeof SUPPORTED_DOC_TYPES)[number];

/**
 * Never claims legal acceptance — a readiness report identifies status and
 * potential issues only. The official authority makes the final decision.
 */
export function buildReadinessReport(
  documentId: string,
  findings: DocumentFinding[],
): ReadinessReport {
  const blockers = findings.filter((f) => f.severity === 'blocker').length;
  const totalChecks = findings.length || 1;
  const status: DocumentStatus = blockers > 0 ? 'review_required' : findings.length === 0 ? 'ready' : 'review_required';
  return {
    documentId,
    status,
    findings,
    readyCount: Math.max(0, totalChecks - blockers),
    totalChecks,
    generatedAt: new Date().toISOString(),
  };
}
