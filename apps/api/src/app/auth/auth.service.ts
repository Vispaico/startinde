import { Injectable } from '@nestjs/common';
import { getPool } from '@startinde/database';
import { sendMail, wrapHtml, isMailConfigured } from '@startinde/mail';
import {
  buildMagicLinkUrl,
  generateMagicToken,
  hashToken,
  loadAuthConfig,
  signSessionToken,
  verifySessionToken,
  type SessionUser,
} from '@startinde/auth';

@Injectable()
export class AuthService {
  private readonly config = loadAuthConfig();

  /**
   * Request a magic link. Creates the user if they don't exist yet
   * (progressive onboarding — assessment-first, account at the end).
   */
  async requestMagicLink(email: string, locale = 'en') {
    const pool = getPool();
    const normalized = email.trim().toLowerCase();
    if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      return { ok: false, error: 'A valid email address is required.' };
    }

    // Upsert user.
    const existing = await pool.query('SELECT id, locale FROM users WHERE email = $1', [normalized]);
    let userId: string;
    if (existing.rows[0]) {
      userId = existing.rows[0].id;
    } else {
      const created = await pool.query(
        `INSERT INTO users (email, locale) VALUES ($1, $2) RETURNING id`,
        [normalized, locale],
      );
      userId = created.rows[0].id;
    }

    // Create one-time magic token (hash only, 15 min TTL).
    const rawToken = generateMagicToken();
    const expiresAt = new Date(Date.now() + this.config.magicLinkTtlMs);
    await pool.query(
      `INSERT INTO auth_tokens (user_id, token_hash, type, expires_at)
       VALUES ($1, $2, 'magic_link', $3)`,
      [userId, hashToken(rawToken), expiresAt],
    );

    const link = buildMagicLinkUrl(rawToken, normalized, this.config);
    const subject = 'Your StartinDE sign-in link';

    if (isMailConfigured()) {
      await sendMail({
        to: normalized,
        subject,
        text: `Sign in to StartinDE:\n\n${link}\n\nThis link expires in 15 minutes. If you didn't request it, ignore this email.`,
        html: wrapHtml(
          `<h2 style="color:#e4ae4d;margin:0 0 16px;">Sign in to StartinDE</h2>
           <p style="color:#eaeef4;line-height:1.6;">Click the button below to sign in. This link expires in <strong>15 minutes</strong>.</p>
           <p style="margin:24px 0;">
             <a href="${link}" style="background:#dc9a2b;color:#0a0f1a;text-decoration:none;padding:12px 24px;border-radius:9999px;font-weight:600;">Sign in</a>
           </p>
           <p style="color:#a8b8cd;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>`,
        ),
      });
    } else {
      // SMTP not configured — dev mode: log the link so flows are testable.
      console.log(`[auth] magic link for ${normalized}: ${link}`);
    }

    return { ok: true, sent: isMailConfigured() };
  }

  /** Exchange a magic link for a session JWT. */
  async verifyMagicLink(token: string, email: string): Promise<{
    ok: boolean;
    session?: string;
    user?: SessionUser;
    error?: string;
  }> {
    const pool = getPool();
    const normalized = email.trim().toLowerCase();
    const tokenHash = hashToken(token);

    const res = await pool.query(
      `SELECT at.id AS token_id, at.user_id, at.expires_at, at.used_at,
              u.email, u.role, u.locale
         FROM auth_tokens at
         JOIN users u ON u.id = at.user_id
        WHERE at.token_hash = $1 AND at.type = 'magic_link'`,
      [tokenHash],
    );
    const row = res.rows[0] as
      | { token_id: string; user_id: string; expires_at: Date; used_at: Date | null; email: string; role: string; locale: string }
      | undefined;

    if (!row || row.email !== normalized) {
      return { ok: false, error: 'Invalid or expired sign-in link.' };
    }
    if (row.used_at) {
      return { ok: false, error: 'This sign-in link has already been used.' };
    }
    if (new Date(row.expires_at) < new Date()) {
      return { ok: false, error: 'This sign-in link has expired.' };
    }

    // Mark used + email verified.
    await pool.query(
      `UPDATE auth_tokens SET used_at = now() WHERE id = $1`,
      [row.token_id],
    );
    await pool.query(
      `UPDATE users SET email_verified_at = now() WHERE id = $1`,
      [row.user_id],
    );

    const user: SessionUser = {
      id: row.user_id,
      email: row.email,
      role: (row.role as SessionUser['role']) ?? 'user',
      locale: row.locale ?? 'en',
    };
    const session = await signSessionToken(user, this.config);
    return { ok: true, session, user };
  }

  /** Resolve a session JWT → user (for /auth/me). */
  async me(token: string): Promise<{ ok: boolean; user?: SessionUser; error?: string }> {
    try {
      const user = await verifySessionToken(token, this.config);
      return { ok: true, user };
    } catch {
      return { ok: false, error: 'Invalid session.' };
    }
  }
}
