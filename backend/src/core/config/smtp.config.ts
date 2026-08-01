import nodemailer, { type Transporter } from 'nodemailer';
import env, { environment } from './env.config.js';

const isConfigured = Boolean(
  env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD,
);

let transporter: Transporter | null = null;

const createTransporter = (): Transporter => {
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
};

export const getTransporter = (): Transporter => {
  if (!isConfigured) {
    throw new Error(
      '[mail] SMTP is not configured — set SMTP_HOST, SMTP_USER, SMTP_PASSWORD',
    );
  }
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
};

export const verifyMailConnection = async (): Promise<boolean> => {
  if (!isConfigured) {
    console.warn('[mail] SMTP not configured, skipping verification');
    return false;
  }
  try {
    await getTransporter().verify();
    console.log('[mail] SMTP connection verified');
    return true;
  } catch (err) {
    console.error('[mail] SMTP verification failed', err);
    return false;
  }
};

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: { filename: string; content: Buffer | string }[];
}

export const sendMail = async (options: SendMailOptions): Promise<void> => {
  const mailer = getTransporter();

  try {
    await mailer.sendMail({
      from: env.MAIL_FROM ?? env.SMTP_USER,
      ...options,
    });
  } catch (err) {
    console.error('[mail] Failed to send email', {
      to: options.to,
      subject: options.subject,
      err,
    });
    throw err;
  }
};

export const closeMailConnection = (): void => {
  if (transporter) {
    transporter.close();
    transporter = null;
    console.log('[mail] Transporter closed');
  }
};

if (!environment.PRODUCTION && !isConfigured) {
  console.warn(
    '[mail] SMTP credentials missing — email sending is disabled in this environment',
  );
}

process.on('SIGTERM', closeMailConnection);
process.on('SIGINT', closeMailConnection);

export default {
  getTransporter,
  verifyMailConnection,
  sendMail,
  closeMailConnection,
};
