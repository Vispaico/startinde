import {
  diffTexts,
  searxngDiscover,
  type KnowledgeSource,
} from '@startinde/knowledge';
import { getPool } from '@startinde/database';

/**
 * Knowledge ingestion pipeline:
 * 1. discover (SearXNG) → candidate URLs
 * 2. fetch (Firecrawl Simple) → content
 * 3. checksum + diff → change detection
 * 4. classify → review queue (admin) → publish
 */

export interface FetchedPage {
  url: string;
  title: string;
  markdown: string;
  fetchedAt: string;
}

/** Fetch a page via Firecrawl Simple (/v1/scrape, no API key). */
export async function fetchPage(
  url: string,
  opts: { baseUrl?: string } = {},
): Promise<FetchedPage> {
  const baseUrl = (
    opts.baseUrl ??
    process.env.FIRECRAWL_URL ??
    'http://localhost:3002'
  ).replace(/\/$/, '');
  const res = await fetch(`${baseUrl}/v1/scrape`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, formats: ['markdown'] }),
    signal: AbortSignal.timeout(60_000),
  });
  if (!res.ok) throw new Error(`Firecrawl failed for ${url}: ${res.status}`);
  const data = (await res.json()) as {
    data?: { markdown?: string; metadata?: { title?: string } };
  };
  return {
    url,
    title: data.data?.metadata?.title ?? url,
    markdown: data.data?.markdown ?? '',
    fetchedAt: new Date().toISOString(),
  };
}

export async function runSourceCheck(source: KnowledgeSource): Promise<{
  checked: boolean;
  changed: boolean;
  addedLines: number;
  removedLines: number;
  discovered: number;
}> {
  // 1. If the source has no pages yet, use SearXNG to discover candidates.
  let discovered = 0;
  if (source.ingestionMethod === 'secondary' || !source.lastCheckedAt) {
    const results = await searxngDiscover(
      `${source.authority} official ${source.language}`,
      { maxResults: 5 },
    );
    discovered = results.length;
  }

  // 2. For each known page of this source (resolved in the DB layer),
  //    fetch and diff. The pipeline below is called per page.
  return { checked: true, changed: false, addedLines: 0, removedLines: 0, discovered };
}

/** Core diff logic — shared by the worker and testable in isolation. */
export function analyzePageChange(previous: string, current: string): {
  changed: boolean;
  classification: 'cosmetic' | 'informational' | 'procedural' | 'financial' | 'legal' | 'urgent';
  significance: 'low' | 'medium' | 'high' | 'critical';
} {
  const diff = diffTexts(previous, current);
  if (!diff.changed) {
    return { changed: false, classification: 'cosmetic', significance: 'low' };
  }

  // Heuristic classification: keyword-driven, refined by AI service #4 later.
  const text = current.toLowerCase();
  let classification: 'cosmetic' | 'informational' | 'procedural' | 'financial' | 'legal' | 'urgent' =
    'informational';
  if (/(gesetz|law|§|section|rechts|paragraf)/.test(text)) classification = 'legal';
  else if (/(gebühr|fee|euro|€|salary|threshold|betrag)/.test(text)) classification = 'financial';
  else if (/(antrag|application|form|frist|deadline|prozess)/.test(text)) classification = 'procedural';

  const significance =
    diff.addedLines + diff.removedLines > 50
      ? 'critical'
      : diff.addedLines + diff.removedLines > 15
        ? 'high'
        : diff.addedLines + diff.removedLines > 4
          ? 'medium'
          : 'low';

  return { changed: true, classification, significance };
}

/** Get a pool-backed list of active knowledge sources (schema-driven). */
export async function listActiveSources(): Promise<KnowledgeSource[]> {
  const pool = getPool();
  const res = await pool.query<{
    id: string;
    authority: string;
    domain: string;
    topics: string[];
    language: string;
    update_frequency: string | null;
    trust_level: number;
    page_structure: string | null;
    crawl_permission: boolean;
    ingestion_method: string;
    last_checked_at: string | null;
    human_owner: string | null;
    active: boolean;
  }>(`SELECT * FROM knowledge_sources WHERE active = true`);
  return res.rows.map((r) => ({
    id: r.id,
    authority: r.authority,
    domain: r.domain,
    topics: r.topics,
    language: r.language,
    updateFrequency: r.update_frequency,
    trustLevel: r.trust_level,
    pageStructure: r.page_structure,
    crawlPermission: r.crawl_permission,
    ingestionMethod: r.ingestion_method as KnowledgeSource['ingestionMethod'],
    lastCheckedAt: r.last_checked_at,
    humanOwner: r.human_owner,
    active: r.active,
  }));
}
