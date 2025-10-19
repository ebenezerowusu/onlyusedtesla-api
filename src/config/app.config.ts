// src/config/app.config.ts
import { z } from 'zod';

const Common = z.object({
  PORT: z.coerce.number().default(3003),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PUBLIC_BASE_URL: z.string().url().default('http://localhost:3003'),
  COUNTRY_GUARD_DISABLED: z.string()
});

const Azure = z.object({
  COSMOSDB_ENDPOINT: z.string().url(),
  COSMOSDB_KEY: z.string().min(1),
  DEFAULT_COSMOS_DB: z.string().default('OnlyUsedTesla-v2'),
  AZURE_STORAGE_CONNECTION_STRING: z.string().min(1),
  AZURE_STORAGE_CONTAINER_PRIVATE: z.string().default('private'),
  AZURE_STORAGE_CONTAINER_PUBLIC: z.string().default('public'),
  AZURE_STORAGE_SAS_TTL_MINUTES: z.coerce.number().default(10),
  AZURE_STORAGE_ACCOUNT: z.string().optional(),
});

const Email = z.object({
  SENDGRID_API_KEY: z.string().min(1),
  SENDGRID_FROM_EMAIL: z.string().email(),
  SENDGRID_FROM_NAME: z.string().min(1),
  SENDGRID_SANDBOX_MODE: z
    .enum(['true', 'false'])
    .default('false')
    .transform(v => v === 'true'),
  SENDGRID_IP_POOL: z.string().optional(),
  SENDGRID_CATEGORIES_BASE: z.string().optional(),
  // Template IDs (including CashOffer alert)
  SENDGRID_TMPL_VERIFY_EMAIL: z.string(),
  SENDGRID_TMPL_WELCOME_PRIVATE: z.string(),
  SENDGRID_TMPL_WELCOME_DEALER: z.string(),
  SENDGRID_TMPL_RESET_PASSWORD: z.string(),
  SENDGRID_TMPL_MFA_CODE_EMAIL: z.string(),
  SENDGRID_TMPL_CHANGE_EMAIL_VERIFY: z.string(),
  SENDGRID_TMPL_NEW_LOGIN_ALERT: z.string(),
  SENDGRID_TMPL_DEALER_APP_RECEIVED: z.string(),
  SENDGRID_TMPL_DEALER_APP_APPROVED: z.string(),
  SENDGRID_TMPL_DEALER_APP_REJECTED: z.string(),
  SENDGRID_TMPL_KYC_APPROVED: z.string(),
  SENDGRID_TMPL_KYC_REJECTED: z.string(),
  SENDGRID_TMPL_DEALER_STAFF_INVITE: z.string(),
  SENDGRID_TMPL_ROLE_CHANGED: z.string(),
  SENDGRID_TMPL_CASHOFFER_ALERT: z.string().optional(),
});

const Sms = z.object({
  TWILIO_ACCOUNT_SID: z.string().min(1),
  TWILIO_AUTH_TOKEN: z.string().min(1),
  TWILIO_MESSAGING_SERVICE_SID: z.string().min(1),
  TWILIO_FROM_PHONE: z.string().min(1),
  TWILIO_SMS_SENDER_FALLBACK: z.string().optional(),
  // Optional env overrides for SMS templates
  SMS_TMPL_MFA_CODE: z.string().optional(),
  SMS_TMPL_OFFER_NEW: z.string().optional(),
  SMS_TMPL_OFFER_COUNTER: z.string().optional(),
  SMS_TMPL_OFFER_ACCEPTED: z.string().optional(),
  SMS_TMPL_OFFER_REJECTED: z.string().optional(),
  SMS_TMPL_CASHOFFER_NEW_LISTING: z.string().optional(),
  SMS_TMPL_KYC_APPROVED: z.string().optional(),
  SMS_TMPL_KYC_REJECTED: z.string().optional(),
});

const Jwt = z.object({
  JWT_ALG: z.literal('EdDSA'),
  JWT_JWKS_PRIVATE_PATH: z.string(),
  JWT_JWKS_PUBLIC_PATH: z.string(),
  JWT_ISSUER: z.string().min(1),
  JWT_AUDIENCE: z.string().min(1),
  JWT_ACCESS_TTL_SEC: z.coerce.number(),
  JWT_REFRESH_TTL_SEC: z.coerce.number(),
});

const Optional = z.object({
  REDIS_URL: z.string().url().optional(),
  UPLOADS_MAX_MB_IMAGE: z.coerce.number().default(10),
  UPLOADS_MAX_MB_PDF: z.coerce.number().default(15),
});

export const AppConfigSchema = Common
  .extend(Azure.shape)
  .extend(Email.shape)
  .extend(Sms.shape)
  .extend(Jwt.shape)
  .extend(Optional.shape);

export type AppConfig = z.infer<typeof AppConfigSchema>;

export function loadConfig(): AppConfig {
  const parsed = AppConfigSchema.safeParse(process.env);
  if (!parsed.success) {
    const msg = parsed.error.issues
      .map((i: z.ZodIssue) => `${i.path.join('.')} ${i.message}`)
      .join('; ');
    throw new Error(`Invalid configuration: ${msg}`);
  }
  return parsed.data;
}
