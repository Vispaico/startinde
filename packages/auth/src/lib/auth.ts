/**
 * Auth — shared types for email magic link + Google OAuth.
 * Implementation lives in the api app; these types keep contracts stable.
 */

export type UserRole = 'user' | 'staff' | 'expert' | 'admin';

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
  locale: string;
}

export interface SignupInput {
  email: string;
  locale?: string;
}

export interface AuthConfig {
  googleClientId: string | null;
  googleClientSecret: string | null;
  sessionSecret: string;
  appUrl: string;
  apiUrl: string;
}

export function loadAuthConfig(): AuthConfig {
  return {
    googleClientId: process.env.GOOGLE_CLIENT_ID ?? null,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? null,
    sessionSecret: process.env.SESSION_SECRET ?? 'dev-insecure-secret-change-me',
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:4200',
    apiUrl: process.env.API_URL ?? 'http://localhost:3000',
  };
}
