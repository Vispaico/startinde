import { createHash, randomBytes } from 'crypto';
import { SignJWT, jwtVerify } from 'jose';

/**
 * Auth core — email magic links + JWT sessions (jose).
 * Google OAuth will be added later (user needs to apply for credentials).
 */

export type UserRole = 'user' | 'staff' | 'expert' | 'admin';

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
  locale: string;
}

export interface AuthConfig {
  sessionSecret: string;
  appUrl: string;
  apiUrl: string;
  magicLinkTtlMs: number;
  sessionTtlSeconds: number;
}

export function loadAuthConfig(): AuthConfig {
  return {
    sessionSecret: process.env.SESSION_SECRET ?? 'dev-insecure-secret-change-me',
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:4200',
    apiUrl: process.env.API_URL ?? 'http://localhost:3000',
    magicLinkTtlMs: Number(process.env.MAGIC_LINK_TTL_MS ?? 15 * 60 * 1000),
    sessionTtlSeconds: Number(process.env.SESSION_TTL_SECONDS ?? 7 * 24 * 60 * 60),
  };
}

function secretKey(config: AuthConfig): Uint8Array {
  return new TextEncoder().encode(config.sessionSecret);
}

/** Generate a raw magic-link token (never persisted — only its hash is). */
export function generateMagicToken(): string {
  return randomBytes(32).toString('hex');
}

/** SHA-256 hash of the raw token, stored in auth_tokens.token_hash. */
export function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

/** Build the verification URL that goes into the email. */
export function buildMagicLinkUrl(rawToken: string, email: string, config: AuthConfig): string {
  const params = new URLSearchParams({ token: rawToken, email });
  return `${config.appUrl}/auth/verify?${params.toString()}`;
}

/** Sign a session JWT for a user. */
export async function signSessionToken(user: SessionUser, config: AuthConfig): Promise<string> {
  return new SignJWT({ email: user.email, role: user.role, locale: user.locale })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + config.sessionTtlSeconds)
    .sign(secretKey(config));
}

/** Verify a session JWT → SessionUser. Throws on invalid/expired. */
export async function verifySessionToken(
  raw: string,
  config: AuthConfig,
): Promise<SessionUser> {
  const { payload } = await jwtVerify(raw, secretKey(config), {
    algorithms: ['HS256'],
  });
  const id = payload.sub;
  if (!id) throw new Error('Session token missing subject');
  return {
    id,
    email: String(payload.email ?? ''),
    role: (payload.role as UserRole) ?? 'user',
    locale: String(payload.locale ?? 'en'),
  };
}
