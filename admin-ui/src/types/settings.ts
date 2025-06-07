/**
 * Types for application settings
 */

export interface CompanySettings {
  name: string;
  email: string;
  website: string;
}

export interface WebhookSettings {
  purchaseSuccess: string;
  purchaseFailed: string;
}

export interface NotificationSettings {
  purchaseConfirmation: boolean;
  failedTransactions: boolean;
  weeklyReports: boolean;
  newProductReleases: boolean;
}

export interface EmailProviderSettings {
  enabled: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  useTls: boolean;
}

export interface PushProviderSettings {
  enabled: boolean;
  fcmApiKey: string;
  fcmUrl: string;
}

export interface WebProviderSettings {
  enabled: boolean;
  // Store devices/user IDs that are subscribed
  subscribers: Array<string>;
  // Configuration options
  vapidPublicKey: string;
  vapidPrivateKey: string;
}

export interface NotificationProviderSettings {
  email: EmailProviderSettings;
  push: PushProviderSettings;
  web: WebProviderSettings;
}

export interface AppSettings {
  company: CompanySettings;
  webhooks: WebhookSettings;
  notifications: NotificationSettings;
  notificationProviders: NotificationProviderSettings;
}

export interface UpdateSettingsRequest {
  company?: Partial<CompanySettings>;
  webhooks?: Partial<WebhookSettings>;
  notifications?: Partial<NotificationSettings>;
  notificationProviders?: Partial<NotificationProviderSettings>;
}

export interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'viewer';
  status: 'active' | 'pending';
}

export interface TeamMemberInvite {
  email: string;
  role: 'admin' | 'manager' | 'viewer';
}

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  created_at: string;
  last_used: string | null;
}

export interface ApiKeyWithKey extends ApiKey {
  key: string;
}

export interface ApiKeyCreateRequest {
  name: string;
  prefix?: string;
}

export interface ApiKeyResponse {
  apiKey: string;
}

export interface ApiKeysResponse {
  success: boolean;
  data: ApiKey[];
}

export interface ApiKeyCreateResponse {
  success: boolean;
  data: ApiKeyWithKey;
  message: string;
}

export interface ApiKeyRotateResponse {
  success: boolean;
  data: ApiKeyWithKey;
  message: string;
}

export interface ApiKeyDeleteResponse {
  success: boolean;
  message: string;
}

export interface PasswordUpdateRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ProfileUpdateRequest {
  name?: string;
  email?: string;
}