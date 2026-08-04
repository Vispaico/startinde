/**
 * Seven specialized AI services — each with input/output schemas, limited
 * tools, model version, tests, validation, logging. No giant system prompt.
 */

// 1. User conversation — profile-aware, RAG-only
export interface ConversationInput {
  userId: string;
  question: string;
  profile: {
    nationality?: string;
    pathway?: string;
    qualification?: string;
    germanLevel?: string;
  };
  retrievedChunks: { content: string; sourceId: string; title: string; lastVerified: string }[];
}

export interface Citation {
  title: string;
  sourceId: string;
  lastVerified: string;
}

export interface ConversationOutput {
  answer: string;
  why: string;
  confidence: 'low' | 'medium' | 'high';
  limitations: string[];
  citations: Citation[];
  nextAction: { type: string; label: string } | null;
  escalateToExpert: boolean;
}

// 2. Document extraction — documents → structured JSON
export interface DocumentExtractionInput {
  documentId: string;
  docType: string;
  content: string; // OCR/preprocessed text
}

export interface DocumentExtractionOutput {
  fields: Record<string, string | number | boolean | null>;
  confidence: number;
  warnings: string[];
}

// 3. Document analysis — consistency, completeness, issues
export interface DocumentAnalysisInput {
  documentId: string;
  docType: string;
  extraction: DocumentExtractionOutput;
  userProfile: Record<string, unknown>;
}

export interface Finding {
  type: string;
  severity: 'info' | 'warning' | 'blocker';
  message: string;
  recommendedAction: string;
}

export interface DocumentAnalysisOutput {
  findings: Finding[];
  ready: boolean;
}

// 4. Source change analysis — explain what changed on an official page
export interface ChangeAnalysisInput {
  oldContent: string;
  newContent: string;
  sourceUrl: string;
  sourceAuthority: string;
}

export interface ChangeAnalysisOutput {
  summary: string;
  classification: 'cosmetic' | 'informational' | 'procedural' | 'financial' | 'legal' | 'urgent';
  significance: 'low' | 'medium' | 'high' | 'critical';
  affectedPathways: string[];
  affectedRules: string[];
  affectedPages: string[];
  affectedUserTypes: string[];
  suggestedUpdate: string;
}

// 5. Content generation — draft public explanations from approved facts
export interface ContentGenerationInput {
  topic: string;
  facts: { statement: string; sourceId: string; lastVerified: string }[];
  targetAudience: string;
  locale: string;
}

export interface ContentGenerationOutput {
  title: string;
  body: string;
  citations: Citation[];
}

// 6. Translation — language versions; legal content flagged for review
export interface TranslationInput {
  text: string;
  sourceLocale: string;
  targetLocale: string;
  isLegalContent: boolean;
}

export interface TranslationOutput {
  translatedText: string;
  needsHumanReview: boolean;
  confidence: 'low' | 'medium' | 'high';
}

// 7. Case summary — concise summaries for human experts
export interface CaseSummaryInput {
  caseTitle: string;
  caseType: string;
  timeline: { date: string; event: string }[];
  documents: string[];
  notes: string[];
  aiFindings: string[];
}

export interface CaseSummaryOutput {
  summary: string;
  keyIssues: string[];
  recommendedNextSteps: string[];
}
