/**
 * Notifications — personalized "Updates for Me" + system notifications.
 */

export type NotificationType =
  | 'policy_change'
  | 'deadline'
  | 'task'
  | 'message'
  | 'appointment'
  | 'service'
  | 'system';

export interface NotificationRecord {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string | null;
  data: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
}

/**
 * Relevance filter — the key "Updates for Me" principle:
 * a Blue Card applicant never gets student-visa noise.
 */
export function isRelevantForUser(
  notification: { type: NotificationType; data: Record<string, unknown> | null },
  user: { pathway?: string | null; nationality?: string | null; topics?: string[] },
): boolean {
  const data = notification.data ?? {};
  if (notification.type !== 'policy_change') return true;
  if (user.pathway && data.pathway && data.pathway !== user.pathway) return false;
  if (user.nationality && data.nationality && data.nationality !== user.nationality) return false;
  if (data.topics && Array.isArray(data.topics) && user.topics) {
    return data.topics.some((t: string) => user.topics?.includes(t));
  }
  return true;
}
