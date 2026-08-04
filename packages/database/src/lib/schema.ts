import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  integer,
  boolean,
  date,
  numeric,
} from 'drizzle-orm/pg-core';

/**
 * Core user model.
 * A User is an account; UserProfile holds the current situation snapshot
 * (nationality, education, employment, language, family).
 */
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  emailVerifiedAt: timestamp('email_verified_at'),
  passwordHash: text('password_hash'),
  googleId: text('google_id').unique(),
  role: text('role', { enum: ['user', 'staff', 'expert', 'admin'] })
    .notNull()
    .default('user'),
  locale: text('locale').notNull().default('en'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  nationality: text('nationality'),
  countryOfResidence: text('country_of_residence'),
  birthYear: integer('birth_year'),
  highestQualification: text('highest_qualification'),
  profession: text('profession'),
  yearsOfExperience: integer('years_of_experience'),
  hasJobOffer: boolean('has_job_offer'),
  hasUniversityAdmission: boolean('has_university_admission'),
  offeredSalary: integer('offered_salary'),
  germanLevel: text('german_level'),
  englishLevel: text('english_level'),
  intendedArrivalDate: date('intended_arrival_date'),
  movingAlone: boolean('moving_alone'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const education = pgTable('education', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  degree: text('degree').notNull(),
  fieldOfStudy: text('field_of_study'),
  institution: text('institution'),
  country: text('country'),
  yearObtained: integer('year_obtained'),
});

export const employment = pgTable('employment', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  occupation: text('occupation').notNull(),
  employer: text('employer'),
  startYear: integer('start_year'),
  endYear: integer('end_year'),
});

export const languageSkills = pgTable('language_skills', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  language: text('language').notNull(),
  level: text('level', {
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'native'],
  }).notNull(),
  certificate: text('certificate'),
});

export const familyMembers = pgTable('family_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  relation: text('relation').notNull(),
  nationality: text('nationality'),
  willAccompany: boolean('will_accompany').notNull().default(false),
});

/**
 * Pathways are versioned sets of conditions/requirements — never static text.
 */
export const pathways = pgTable('pathways', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const pathwayVersions = pgTable('pathway_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  pathwayId: uuid('pathway_id')
    .notNull()
    .references(() => pathways.id, { onDelete: 'cascade' }),
  version: text('version').notNull(),
  effectiveFrom: date('effective_from').notNull(),
  effectiveTo: date('effective_to'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const requirements = pgTable('requirements', {
  id: uuid('id').primaryKey().defaultRandom(),
  pathwayVersionId: uuid('pathway_version_id')
    .notNull()
    .references(() => pathwayVersions.id, { onDelete: 'cascade' }),
  key: text('key').notNull(),
  label: text('label').notNull(),
  description: text('description'),
  order: integer('order').notNull().default(0),
});

export const requirementRules = pgTable('requirement_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  requirementId: uuid('requirement_id')
    .notNull()
    .references(() => requirements.id, { onDelete: 'cascade' }),
  ruleId: text('rule_id').notNull(),
  sourceUrl: text('source_url'),
  effectiveDate: date('effective_date'),
  expiryDate: date('expiry_date'),
  conditions: jsonb('conditions').notNull(),
  exceptions: jsonb('exceptions'),
  reviewer: text('reviewer'),
  lastVerified: timestamp('last_verified').notNull().defaultNow(),
});

/**
 * Assessments link a user to the exact pathway version used at the time.
 */
export const assessments = pgTable('assessments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  goal: text('goal').notNull(),
  status: text('status', {
    enum: ['in_progress', 'completed', 'abandoned'],
  })
    .notNull()
    .default('in_progress'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
});

export const assessmentAnswers = pgTable('assessment_answers', {
  id: uuid('id').primaryKey().defaultRandom(),
  assessmentId: uuid('assessment_id')
    .notNull()
    .references(() => assessments.id, { onDelete: 'cascade' }),
  questionKey: text('question_key').notNull(),
  answer: jsonb('answer').notNull(),
  answeredAt: timestamp('answered_at').notNull().defaultNow(),
});

export const assessmentResults = pgTable('assessment_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  assessmentId: uuid('assessment_id')
    .notNull()
    .references(() => assessments.id, { onDelete: 'cascade' }),
  pathwayId: uuid('pathway_id')
    .notNull()
    .references(() => pathways.id),
  pathwayVersionId: uuid('pathway_version_id')
    .notNull()
    .references(() => pathwayVersions.id),
  readinessMet: integer('readiness_met').notNull().default(0),
  readinessTotal: integer('readiness_total').notNull().default(0),
  isPrimary: boolean('is_primary').notNull().default(false),
  rank: integer('rank').notNull().default(0),
  ruleResults: jsonb('rule_results'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

/**
 * Cases: one or more application workspaces per user.
 */
export const cases = pgTable('cases', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  caseType: text('case_type').notNull(),
  status: text('status', {
    enum: ['draft', 'active', 'on_hold', 'submitted', 'approved', 'rejected', 'closed'],
  })
    .notNull()
    .default('draft'),
  pathwayId: uuid('pathway_id').references(() => pathways.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const caseTasks = pgTable('case_tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  caseId: uuid('case_id')
    .notNull()
    .references(() => cases.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status', {
    enum: ['todo', 'in_progress', 'done', 'blocked'],
  })
    .notNull()
    .default('todo'),
  dueDate: date('due_date'),
  order: integer('order').notNull().default(0),
});

export const caseDeadlines = pgTable('case_deadlines', {
  id: uuid('id').primaryKey().defaultRandom(),
  caseId: uuid('case_id')
    .notNull()
    .references(() => cases.id, { onDelete: 'cascade' }),
  label: text('label').notNull(),
  dueAt: timestamp('due_at').notNull(),
  completedAt: timestamp('completed_at'),
});

export const caseNotes = pgTable('case_notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  caseId: uuid('case_id')
    .notNull()
    .references(() => cases.id, { onDelete: 'cascade' }),
  authorId: uuid('author_id').references(() => users.id),
  body: text('body').notNull(),
  isExpertNote: boolean('is_expert_note').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

/**
 * Documents: per-user, versioned, extracted + findings.
 */
export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  caseId: uuid('case_id').references(() => cases.id, { onDelete: 'set null' }),
  docType: text('doc_type').notNull(),
  storageKey: text('storage_key').notNull(),
  originalName: text('original_name').notNull(),
  mimeType: text('mime_type'),
  sizeBytes: integer('size_bytes'),
  status: text('status', {
    enum: ['uploaded', 'processing', 'ready', 'review_required', 'rejected'],
  })
    .notNull()
    .default('uploaded'),
  consentGiven: boolean('consent_given').notNull().default(false),
  retentionUntil: timestamp('retention_until'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const documentVersions = pgTable('document_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  documentId: uuid('document_id')
    .notNull()
    .references(() => documents.id, { onDelete: 'cascade' }),
  version: integer('version').notNull().default(1),
  storageKey: text('storage_key').notNull(),
  checksum: text('checksum'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const documentExtractions = pgTable('document_extractions', {
  id: uuid('id').primaryKey().defaultRandom(),
  documentId: uuid('document_id')
    .notNull()
    .references(() => documents.id, { onDelete: 'cascade' }),
  fields: jsonb('fields').notNull(),
  confidence: numeric('confidence'),
  modelVersion: text('model_version'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const documentFindings = pgTable('document_findings', {
  id: uuid('id').primaryKey().defaultRandom(),
  documentId: uuid('document_id')
    .notNull()
    .references(() => documents.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  severity: text('severity', {
    enum: ['info', 'warning', 'blocker'],
  })
    .notNull()
    .default('info'),
  message: text('message').notNull(),
  recommendedAction: text('recommended_action'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

/**
 * Knowledge engine: sources → pages → versions → chunks → changes → reviews.
 */
export const knowledgeSources = pgTable('knowledge_sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  authority: text('authority').notNull(),
  domain: text('domain').notNull(),
  topics: jsonb('topics').notNull().default([]),
  language: text('language').notNull().default('de'),
  updateFrequency: text('update_frequency'),
  trustLevel: integer('trust_level').notNull().default(5),
  pageStructure: text('page_structure'),
  crawlPermission: boolean('crawl_permission').notNull().default(true),
  ingestionMethod: text('ingestion_method', {
    enum: ['api', 'html', 'structured', 'pdf', 'secondary'],
  })
    .notNull()
    .default('html'),
  lastCheckedAt: timestamp('last_checked_at'),
  humanOwner: text('human_owner'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const knowledgePages = pgTable('knowledge_pages', {
  id: uuid('id').primaryKey().defaultRandom(),
  sourceId: uuid('source_id')
    .notNull()
    .references(() => knowledgeSources.id, { onDelete: 'cascade' }),
  url: text('url').notNull().unique(),
  title: text('title'),
  sectionHeading: text('section_heading'),
  language: text('language').notNull().default('de'),
  checksum: text('checksum'),
  fetchedAt: timestamp('fetched_at'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const knowledgeVersions = pgTable('knowledge_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  pageId: uuid('page_id')
    .notNull()
    .references(() => knowledgePages.id, { onDelete: 'cascade' }),
  version: integer('version').notNull().default(1),
  content: text('content').notNull(),
  checksum: text('checksum').notNull(),
  effectiveDate: date('effective_date'),
  supersededVersionId: uuid('superseded_version_id'),
  reviewStatus: text('review_status', {
    enum: ['draft', 'in_review', 'approved', 'rejected', 'superseded'],
  })
    .notNull()
    .default('draft'),
  lastVerifiedAt: timestamp('last_verified_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const knowledgeChunks = pgTable('knowledge_chunks', {
  id: uuid('id').primaryKey().defaultRandom(),
  versionId: uuid('version_id')
    .notNull()
    .references(() => knowledgeVersions.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  qdrantPointId: text('qdrant_point_id'),
  order: integer('order').notNull().default(0),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const knowledgeChanges = pgTable('knowledge_changes', {
  id: uuid('id').primaryKey().defaultRandom(),
  pageId: uuid('page_id')
    .notNull()
    .references(() => knowledgePages.id, { onDelete: 'cascade' }),
  oldContent: text('old_content'),
  newContent: text('new_content'),
  classification: text('classification', {
    enum: ['cosmetic', 'informational', 'procedural', 'financial', 'legal', 'urgent'],
  }),
  aiSummary: text('ai_summary'),
  significance: text('significance', {
    enum: ['low', 'medium', 'high', 'critical'],
  }),
  affectedPathways: jsonb('affected_pathways').notNull().default([]),
  affectedRules: jsonb('affected_rules').notNull().default([]),
  affectedPages: jsonb('affected_pages').notNull().default([]),
  affectedUsers: jsonb('affected_users').notNull().default([]),
  suggestedUpdate: text('suggested_update'),
  status: text('status', {
    enum: ['detected', 'review', 'approved', 'rejected', 'published'],
  })
    .notNull()
    .default('detected'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  resolvedAt: timestamp('resolved_at'),
});

export const knowledgeReviews = pgTable('knowledge_reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  changeId: uuid('change_id')
    .notNull()
    .references(() => knowledgeChanges.id, { onDelete: 'cascade' }),
  reviewerId: uuid('reviewer_id').references(() => users.id),
  decision: text('decision', {
    enum: ['approved', 'edited', 'rejected', 'assigned'],
  }),
  comment: text('comment'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

/**
 * Commerce: services, orders, appointments, experts.
 */
export const services = pgTable('services', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type', { enum: ['digital', 'human', 'partner'] })
    .notNull()
    .default('digital'),
  priceCents: integer('price_cents'),
  currency: text('currency').notNull().default('EUR'),
  stripePriceId: text('stripe_price_id'),
  isSubscription: boolean('is_subscription').notNull().default(false),
  active: boolean('active').notNull().default(true),
});

export const serviceOrders = pgTable('service_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  serviceId: uuid('service_id')
    .notNull()
    .references(() => services.id),
  status: text('status', {
    enum: ['pending', 'paid', 'fulfilling', 'completed', 'refunded', 'cancelled'],
  })
    .notNull()
    .default('pending'),
  stripeSessionId: text('stripe_session_id'),
  amountCents: integer('amount_cents'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const experts = pgTable('experts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  specialty: jsonb('specialty').notNull().default([]),
  bio: text('bio'),
  isLawyer: boolean('is_lawyer').notNull().default(false),
  licenseRef: text('license_ref'),
  active: boolean('active').notNull().default(true),
});

export const appointments = pgTable('appointments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expertId: uuid('expert_id').references(() => experts.id),
  caseId: uuid('case_id').references(() => cases.id),
  scheduledAt: timestamp('scheduled_at').notNull(),
  durationMinutes: integer('duration_minutes').notNull().default(30),
  status: text('status', {
    enum: ['scheduled', 'completed', 'cancelled', 'no_show'],
  })
    .notNull()
    .default('scheduled'),
  meetingUrl: text('meeting_url'),
});

export const expertReviews = pgTable('expert_reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  expertId: uuid('expert_id')
    .notNull()
    .references(() => experts.id),
  caseId: uuid('case_id').references(() => cases.id),
  documentId: uuid('document_id').references(() => documents.id),
  status: text('status', {
    enum: ['queued', 'in_progress', 'completed'],
  })
    .notNull()
    .default('queued'),
  findings: jsonb('findings'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

/**
 * AI conversations + citations.
 */
export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id')
    .notNull()
    .references(() => conversations.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['user', 'assistant', 'system'] }).notNull(),
  content: text('content').notNull(),
  confidence: text('confidence'),
  limitations: jsonb('limitations'),
  nextAction: jsonb('next_action'),
  modelVersion: text('model_version'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const citations = pgTable('citations', {
  id: uuid('id').primaryKey().defaultRandom(),
  messageId: uuid('message_id')
    .notNull()
    .references(() => messages.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  sourceId: text('source_id').notNull(),
  sourceUrl: text('source_url'),
  lastVerified: timestamp('last_verified'),
});

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  title: text('title').notNull(),
  body: text('body'),
  data: jsonb('data'),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

/**
 * Compliance: audit + consent.
 */
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  actorId: uuid('actor_id'),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id'),
  metadata: jsonb('metadata'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const consentRecords = pgTable('consent_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  consentType: text('consent_type').notNull(),
  granted: boolean('granted').notNull(),
  version: text('version'),
  grantedAt: timestamp('granted_at').notNull().defaultNow(),
  revokedAt: timestamp('revoked_at'),
});
