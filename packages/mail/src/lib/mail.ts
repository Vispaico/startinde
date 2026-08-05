import nodemailer, { type Transporter } from 'nodemailer';

/**
 * Mail — SMTP via user's Hostinger service (configured in .env).
 * Used by the worker for transactional email (assessment complete,
 * report delivered, policy-change alerts, deadline reminders).
 */

export interface MailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  secure?: boolean;
}

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}

export function loadMailConfig(): MailConfig {
  return {
    host: process.env.SMTP_HOST ?? '',
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER ?? '',
    pass: process.env.SMTP_PASS ?? '',
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER ?? 'no-reply@startin-de.com',
    secure: Number(process.env.SMTP_PORT ?? 587) === 465,
  };
}

let cachedTransporter: Transporter | null = null;

export function getTransporter(config: MailConfig = loadMailConfig()): Transporter {
  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.user
        ? { user: config.user, pass: config.pass }
        : undefined,
    });
  }
  return cachedTransporter;
}

export function isMailConfigured(config: MailConfig = loadMailConfig()): boolean {
  return Boolean(config.host && config.user && config.pass);
}

export async function sendMail(
  message: MailMessage,
  config: MailConfig = loadMailConfig(),
): Promise<{ messageId: string; sent: boolean }> {
  if (!isMailConfigured(config)) {
    return { messageId: '', sent: false };
  }
  const info = await getTransporter(config).sendMail({
    from: config.from,
    to: message.to,
    subject: message.subject,
    text: message.text,
    html: message.html,
    replyTo: message.replyTo,
  });
  return { messageId: info.messageId, sent: true };
}

/** Simple HTML wrapper for transactional emails with brand colors. */
export function wrapHtml(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#0a0f1a;font-family:Inter,Arial,sans-serif;">
    <div style="max-width:600px;margin:0 auto;padding:32px 24px;">
      <div style="background:#121a28;border:1px solid #2d3d55;border-radius:16px;padding:32px;color:#eaeef4;">
        ${bodyHtml}
        <p style="margin-top:32px;padding-top:16px;border-top:1px solid #2d3d55;font-size:12px;color:#7a90ad;">
          StartinDE — Your verified personal path to Germany.<br/>
          General information, not legal advice.
        </p>
      </div>
    </div>
  </body>
</html>`;
}
