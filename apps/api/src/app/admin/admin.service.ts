import { Injectable } from '@nestjs/common';
import { getPool } from '@startinde/database';

/**
 * Admin service — knowledge change review workflow.
 * Reviewer sees: old/new text, AI summary, significance, affected
 * pathways/rules/pages/users, suggested update → [Approve][Edit][Reject][Assign].
 */

export type ReviewDecision = 'approved' | 'edited' | 'rejected' | 'assigned';

const PAGE_SIZE = 50;

@Injectable()
export class AdminService {
  async listChanges(status?: string) {
    const pool = getPool();
    const params: unknown[] = [];
    let where = '';
    if (status && status !== 'all') {
      params.push(status);
      where = `WHERE kc.status = $${params.length}`;
    }
    const res = await pool.query(
      `SELECT kc.id, kc.classification, kc.significance, kc.status,
              kc.created_at, kc.ai_summary, kp.url, kp.title, ks.authority
         FROM knowledge_changes kc
         JOIN knowledge_pages kp ON kp.id = kc.page_id
         JOIN knowledge_sources ks ON ks.id = kp.source_id
         ${where}
        ORDER BY kc.created_at DESC
        LIMIT $${params.length + 1}`,
      [...params, PAGE_SIZE],
    );
    return { changes: res.rows };
  }

  async getChange(id: string) {
    const pool = getPool();
    const res = await pool.query(
      `SELECT kc.*, kp.url, kp.title, ks.authority
         FROM knowledge_changes kc
         JOIN knowledge_pages kp ON kp.id = kc.page_id
         JOIN knowledge_sources ks ON ks.id = kp.source_id
        WHERE kc.id = $1`,
      [id],
    );
    return res.rows[0] ?? null;
  }

  /** Record a reviewer decision; optionally store an edited suggested update. */
  async decide(
    id: string,
    decision: ReviewDecision,
    opts: { comment?: string; editedUpdate?: string; reviewerId?: string } = {},
  ) {
    const pool = getPool();
    const change = (await pool.query('SELECT id FROM knowledge_changes WHERE id = $1', [id])).rows[0];
    if (!change) return { ok: false, error: 'Change not found.' };

    const statusMap: Record<ReviewDecision, string> = {
      approved: 'approved',
      edited: 'approved', // edited then approved
      rejected: 'rejected',
      assigned: 'review',
    };

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      if (decision === 'edited' && opts.editedUpdate) {
        await client.query(`UPDATE knowledge_changes SET suggested_update = $1, status = 'approved' WHERE id = $2`, [
          opts.editedUpdate,
          id,
        ]);
      } else {
        await client.query(`UPDATE knowledge_changes SET status = $1 WHERE id = $2`, [statusMap[decision], id]);
      }
      await client.query(
        `INSERT INTO knowledge_reviews (change_id, reviewer_id, decision, comment)
         VALUES ($1, $2, $3, $4)`,
        [id, opts.reviewerId ?? null, decision, opts.comment ?? null],
      );
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    return { ok: true, decision, status: statusMap[decision] };
  }

  /** Publish an approved change: copy new content to the live version. */
  async publish(id: string) {
    const pool = getPool();
    const res = await pool.query(
      `SELECT kc.page_id, kc.new_content
         FROM knowledge_changes kc WHERE kc.id = $1 AND kc.status = 'approved'`,
      [id],
    );
    const row = res.rows[0] as { page_id: string; new_content: string } | undefined;
    if (!row) return { ok: false, error: 'No approved change to publish.' };

    await pool.query(
      `UPDATE knowledge_versions
          SET content = $1, review_status = 'approved', last_verified_at = now(),
              updated_at = now()
        WHERE page_id = $2
          AND review_status = 'approved'
        ORDER BY version DESC LIMIT 1`,
      [row.new_content, row.page_id],
    );
    await pool.query(`UPDATE knowledge_changes SET status = 'published' WHERE id = $1`, [id]);
    return { ok: true, status: 'published' };
  }
}
