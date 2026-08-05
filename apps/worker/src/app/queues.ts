import { Queue, Worker } from 'bullmq';

export const redisConnection = {
  host: process.env.REDIS_HOST ?? 'localhost',
  port: Number(process.env.REDIS_PORT ?? 6379),
  password: process.env.REDIS_PASSWORD ?? undefined,
};

export const QUEUES = {
  knowledge: 'startinde:knowledge',
  notifications: 'startinde:notifications',
  documents: 'startinde:documents',
} as const;

/** Queue data types are intentionally loose here — processors validate. */
export type QueueData = Record<string, unknown> | unknown;

export function createQueue(name: string): Queue<QueueData> {
  return new Queue<QueueData>(name, {
    connection: redisConnection,
    defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
  });
}

export const knowledgeQueue = createQueue(QUEUES.knowledge);
export const notificationsQueue = createQueue(QUEUES.notifications);
export const documentsQueue = createQueue(QUEUES.documents);

export function createWorker(
  queueName: string,
  processor: (job: { name: string; data: QueueData }) => Promise<unknown>,
): Worker {
  return new Worker(queueName, processor as never, { connection: redisConnection });
}
