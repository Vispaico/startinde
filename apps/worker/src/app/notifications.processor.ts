import { sendMail, wrapHtml, isMailConfigured } from '@startinde/mail';
import { getPool } from '@startinde/database';
import { isRelevantForUser } from '@startinde/notifications';

/**
 * Notifications processor:
 * - email jobs → SMTP (Hostinger, configured in .env)
 * - policy-change jobs → relevance-filtered, in-app notification + email
 */

export async function processEmail(data: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<{ messageId: string; sent: boolean }> {
  const result = await sendMail({
    to: data.to,
    subject: data.subject,
    text: data.text,
    html: data.html ?? wrapHtml(`<h2 style="color:#e4ae4d;margin:0 0 16px;">${data.subject}</h2><p style="color:#eaeef4;line-height:1.6;">${data.text.replace(/\n/g, '<br/>')}</p>`),
  });
  return result;
}

export async function processPolicyChange(data: {
  userId: string;
  changeId: string;
  summary: string;
}): Promise<{ notified: boolean; relevant: boolean }> {
  const pool = getPool();

  // Load user + notification-relevance context.
  const userRes = await pool.query(
    `SELECT u.email, p.nationality
       FROM users u
       LEFT JOIN user_profiles p ON p.user_id = u.id
      WHERE u.id = $1`,
    [data.userId],
  );
  const user = userRes.rows[0] as { email: string; nationality: string | null } | undefined;
  if (!user) return { notified: false, relevant: false };

  // Load the change's affected-user scoping.
  const changeRes = await pool.query(
    `SELECT classification, significance, affected_pathways, affected_users
       FROM knowledge_changes WHERE id = $1`,
    [data.changeId],
  );
  const change = changeRes.rows[0] as
    | { classification: string; significance: string; affected_pathways: unknown; affected_users: unknown }
    | undefined;
  if (!change) return { notified: false, relevant: false };

  // "Updates for Me" — a Blue Card applicant never gets student-visa noise.
  const relevant = isRelevantForUser(
    {
      type: 'policy_change',
      data: {
        pathway: Array.isArray(change.affected_pathways) ? change.affected_pathways[0] : undefined,
        nationality: undefined,
      },
    },
    { nationality: user.nationality, pathway: undefined },
  );
  if (!relevant) return { notified: false, relevant: false };

  // Persist in-app notification.
  await pool.query(
    `INSERT INTO notifications (user_id, type, title, body, data)
     VALUES ($1, 'policy_change', $2, $3, $4)`,
    [
      data.userId,
      `Policy change affecting your pathway`,
      data.summary,
      JSON.stringify({ changeId: data.changeId, significance: change.significance }),
    ],
  );

  // Email — only if SMTP configured.
  if (isMailConfigured()) {
    await sendMail({
      to: user.email,
      subject: `StartinDE update: ${data.summary.slice(0, 80)}`,
      text: data.summary,
    });
  }

  return { notified: true, relevant: true };
}
