import { createWorker, QUEUES, knowledgeQueue } from './app/queues';
import {
  listActiveSources,
  runSourceCheck,
} from './app/knowledge.processor';
import { processEmail, processPolicyChange } from './app/notifications.processor';

async function main() {
  console.log('🧠 StartinDE worker starting…');

  // --- Knowledge queue processors ---
  createWorker(QUEUES.knowledge, async (job) => {
    const data = (job.data ?? {}) as { sourceId?: string; limit?: number; changeId?: string };
    if (job.name === 'check-source') {
      const sources = await listActiveSources();
      const source = sources.find((s) => s.id === data.sourceId);
      if (!source) throw new Error(`Source ${data.sourceId} not found`);
      const result = await runSourceCheck(source);
      console.log(`[knowledge] checked source ${source.authority}:`, result);
      return result;
    }
    if (job.name === 'check-all-sources') {
      const sources = await listActiveSources();
      for (const source of sources.slice(0, data.limit ?? 50)) {
        const result = await runSourceCheck(source);
        console.log(`[knowledge] checked source ${source.authority}:`, result);
      }
      return { checked: sources.length };
    }
    if (job.name === 'analyze-change') {
      // Placeholder — AI service #4 (source change analysis) plugs in here.
      return { analyzed: true, changeId: data.changeId };
    }
    throw new Error(`Unknown knowledge job: ${job.name}`);
  });

  // --- Notifications queue processors ---
  createWorker(QUEUES.notifications, async (job) => {
    if (job.name === 'email') {
      const data = (job.data ?? {}) as { to: string; subject: string; text: string; html?: string };
      return processEmail(data);
    }
    if (job.name === 'policy-change') {
      const data = (job.data ?? {}) as { userId: string; changeId: string; summary: string };
      return processPolicyChange(data);
    }
    throw new Error(`Unknown notification job: ${job.name}`);
  });

  // --- Documents queue (Phase 4 — extraction/analysis) ---
  createWorker(QUEUES.documents, async (job) => {
    const data = (job.data ?? {}) as { documentId?: string };
    console.log(`[documents] ${job.name} for ${data.documentId} (Phase 4 — not yet implemented)`);
    return { pending: true, documentId: data.documentId };
  });

  // --- Scheduled: check all sources daily (BullMQ v6 JobScheduler) ---
  await knowledgeQueue.upsertJobScheduler(
    'daily-source-check',
    { pattern: '0 6 * * *' }, // 06:00 daily
    { name: 'check-all-sources', data: { limit: 50 } },
  );

  console.log('🧠 Worker ready. Queues:', Object.values(QUEUES).join(', '));
}

main().catch((err) => {
  console.error('Worker failed to start:', err);
  process.exit(1);
});
