/**
 * Knowledge engine — source registry, ingestion, change classification,
 * retrieval. Qdrant via PageIndex is the single search/vector layer;
 * Postgres is the source of truth.
 */

export type ChangeClassification =
  | 'cosmetic'
  | 'informational'
  | 'procedural'
  | 'financial'
  | 'legal'
  | 'urgent';

export type Significance = 'low' | 'medium' | 'high' | 'critical';

export type IngestionMethod = 'api' | 'html' | 'structured' | 'pdf' | 'secondary';

export interface KnowledgeSource {
  id: string;
  authority: string;
  domain: string;
  topics: string[];
  language: string;
  updateFrequency: string | null;
  trustLevel: number;
  pageStructure: string | null;
  crawlPermission: boolean;
  ingestionMethod: IngestionMethod;
  lastCheckedAt: string | null;
  humanOwner: string | null;
  active: boolean;
}

export interface KnowledgeChange {
  id: string;
  pageId: string;
  oldContent: string | null;
  newContent: string | null;
  classification: ChangeClassification | null;
  significance: Significance | null;
  affectedPathways: string[];
  affectedRules: string[];
  affectedPages: string[];
  affectedUsers: string[];
  suggestedUpdate: string | null;
  status: 'detected' | 'review' | 'approved' | 'rejected' | 'published';
}

/** Source ingestion priority per spec §8.2 — official API > HTML > structured > PDF > secondary. */
export const INGESTION_PRIORITY: IngestionMethod[] = ['api', 'html', 'structured', 'pdf', 'secondary'];

/** Simple content hash for diff detection. */
export function contentChecksum(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    hash = (hash << 5) - hash + content.charCodeAt(i);
    hash |= 0;
  }
  return `h${hash.toString(16)}:${content.length}`;
}

/** Diff two text versions → changed region summary (line-level). */
export function diffTexts(oldContent: string, newContent: string): {
  changed: boolean;
  addedLines: number;
  removedLines: number;
} {
  const oldLines = oldContent.split('\n');
  const newLines = newContent.split('\n');
  if (oldContent === newContent) return { changed: false, addedLines: 0, removedLines: 0 };
  const oldSet = new Set(oldLines);
  const newSet = new Set(newLines);
  const addedLines = newLines.filter((l) => !oldSet.has(l)).length;
  const removedLines = oldLines.filter((l) => !newSet.has(l)).length;
  return { changed: true, addedLines, removedLines };
}

/**
 * SearXNG discovery — self-hosted at search.vispaico.com, JSON API, no key.
 * Discovery only: finds candidate URLs → source registry → Firecrawl fetch.
 */
export async function searxngDiscover(
  query: string,
  opts: { baseUrl?: string; maxResults?: number } = {},
): Promise<{ title: string; url: string; content: string | null }[]> {
  const baseUrl = (opts.baseUrl ?? process.env.SEARXNG_URL ?? 'https://search.vispaico.com').replace(/\/$/, '');
  const params = new URLSearchParams({ q: query, format: 'json' });
  const res = await fetch(`${baseUrl}/search?${params.toString()}`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`SearXNG failed: ${res.status}`);
  const data = (await res.json()) as { results?: { title?: string; url?: string; content?: string }[] };
  const max = opts.maxResults ?? 10;
  return (data.results ?? [])
    .filter((r) => r.url)
    .slice(0, max)
    .map((r) => ({
      title: r.title ?? '',
      url: r.url as string,
      content: r.content ?? null,
    }));
}
