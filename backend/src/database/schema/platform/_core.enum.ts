import { pgEnum } from 'drizzle-orm/pg-core';

// user enums
export const accountStatusEnum = pgEnum('account_status', [
  'pending',
  'active',
  'inactive',
  'suspended',
]);

// auth

export const oauthProviderEnum = pgEnum('oauth_provider', [
  'google',
  'microsoft',
  'apple',
]);

export const otpPurposeEnum = pgEnum('otp_purpose', [
  'login',
  'signup',
  'mfa',
  'forgot_password',
  'reset_password',
  'change_password',
  'change_email',
  'change_phone',
]);

export const mfaTypeEnum = pgEnum('mfa_type', [
  'totp',
  'sms',
  'email',
  'webauthn',
]);

// rbac enums
export const dataScopeTypeEnum = pgEnum('data_scope_type', [
  'own',
  'team',
  'department',
  'branch',
  'organization',
  'all',
]);

// notification enums
export const notificationChannelEnum = pgEnum('notification_channel', [
  'email',
  'sms',
  'push',
  'whatsapp',
  'slack',
  'teams',
  'discord',
  'webhook',
]);

export const notificationStatusEnum = pgEnum('notification_status', [
  'queued',
  'sent',
  'delivered',
  'failed',
  'read',
]);

// subscription enums
export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'trialing',
  'active',
  'past_due',
  'cancelled',
  'expired',
]);

export const invoiceStatusEnum = pgEnum('invoice_status', [
  'draft',
  'open',
  'paid',
  'void',
  'uncollectible',
]);

export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'succeeded',
  'failed',
  'refunded',
]);

// tenant enums
export const tenantStatusEnum = pgEnum('tenant_status', [
  'trial',
  'pending',
  'active',
  'inactive',
  'suspended',
]);

// branch enums
export const officeTypeEnum = pgEnum('office_type', [
  'head_office',
  'corporate_office',
  'registered_office',
  'branch',
  'regional_office',
  'area_office',
  'zonal_office',
  'satellite_office',
  'representative_office',
  'sales_office',
  'service_center',
  'customer_support_center',
  'call_center',
  'warehouse',
  'distribution_center',
  'fulfillment_center',
  'factory',
  'manufacturing_plant',
  'assembly_plant',
  'research_center',
  'r_and_d_center',
  'training_center',
  'data_center',
  'retail_store',
  'showroom',
  'outlet',
  'franchise',
  'depot',
  'hub',
  'laboratory',
  'clinic',
  'hospital',
  'campus',
  'project_site',
  'temporary_site',
  'remote_office',
  'home_office',
  'other',
]);
