// @ts-nocheck
// ===========================================
// SECURITY MODELS & INTERFACES
// ===========================================

// Enhanced User model with security fields
export interface SecurityUser {
  id: string;
  email?: string;
  phone_number?: string;
  two_factor_enabled: boolean;
  two_factor_secret?: string;
  account_locked_until?: Date;
  failed_login_attempts: number;
  last_login_at?: Date;
  last_login_ip?: string;
  password_changed_at?: Date;
  security_notifications: boolean;
  login_notifications: boolean;
}

// Session management
export interface UserSession {
  id: string;
  user_id: string;
  device_fingerprint: string;
  ip_address: string;
  user_agent: string;
  location?: {
    country?: string;
    city?: string;
    coordinates?: [number, number];
  };
  expires_at: Date;
  is_active: boolean;
  created_at: Date;
  last_activity: Date;
}

// Enhanced RBAC
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Permission {
  id: string;
  resource: string; // 'products', 'orders', 'users', etc.
  action: string; // 'create', 'read', 'update', 'delete'
  conditions?: Record<string, any>; // Dynamic conditions
  is_active: boolean;
}

// OAuth providers
export interface OAuthProvider {
  provider: 'google' | 'facebook' | 'telegram' | 'apple';
  provider_id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  picture?: string;
  access_token?: string;
  refresh_token?: string;
  expires_at?: Date;
}

// Security events
export interface SecurityEvent {
  id: string;
  user_id: string;
  event_type: SecurityEventType;
  ip_address: string;
  user_agent: string;
  metadata?: Record<string, any>;
  created_at: Date;
}

export enum SecurityEventType {
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILED = 'login_failed',
  PASSWORD_CHANGED = 'password_changed',
  TWO_FACTOR_ENABLED = 'two_factor_enabled',
  TWO_FACTOR_DISABLED = 'two_factor_disabled',
  SESSION_CREATED = 'session_created',
  SESSION_TERMINATED = 'session_terminated',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  ACCOUNT_LOCKED = 'account_locked',
  ACCOUNT_UNLOCKED = 'account_unlocked',
}

// Rate limiting
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
}

// Device fingerprinting
export interface DeviceFingerprint {
  fingerprint: string;
  device_type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  screen_resolution?: string;
  timezone?: string;
  language?: string;
}

// Security policies
export interface SecurityPolicy {
  password_policy: {
    min_length: number;
    require_uppercase: boolean;
    require_lowercase: boolean;
    require_numbers: boolean;
    require_symbols: boolean;
    max_age_days: number;
    prevent_reuse_count: number;
  };
  session_policy: {
    max_concurrent_sessions: number;
    idle_timeout_minutes: number;
    absolute_timeout_hours: number;
    refresh_token_rotation: boolean;
  };
  login_policy: {
    max_failed_attempts: number;
    lockout_duration_minutes: number;
    require_captcha_after_attempts: number;
    allow_remember_me: boolean;
  };
  notification_policy: {
    login_alerts: boolean;
    password_change_alerts: boolean;
    suspicious_activity_alerts: boolean;
  };
}

// Token structure
export interface TokenPayload {
  sub: string;
  email?: string;
  phone?: string;
  roles: string[];
  permissions: string[];
  session_id: string;
  device_fingerprint: string;
  iat: number;
  exp: number;
}

// OAuth configuration
export interface OAuthConfig {
  google: {
    client_id: string;
    client_secret: string;
    redirect_uri: string;
    scope: string[];
  };
  facebook: {
    client_id: string;
    client_secret: string;
    redirect_uri: string;
    scope: string[];
  };
  telegram: {
    bot_token: string;
    bot_username: string;
  };
  apple: {
    client_id: string;
    team_id: string;
    key_id: string;
    private_key: string;
  };
}

// Security headers
export interface SecurityHeaders {
  'x-frame-options': string;
  'x-content-type-options': string;
  'x-xss-protection': string;
  'strict-transport-security': string;
  'content-security-policy': string;
  'referrer-policy': string;
  'permissions-policy': string;
}

// API rate limiting
export interface ApiRateLimit {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  windowMs: number;
  maxRequests: number;
  skipIfAuthenticated: boolean;
  errorMessage: string;
}

// Password reset
export interface PasswordResetRequest {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  used: boolean;
  ip_address: string;
  user_agent: string;
}

// Email verification
export interface EmailVerification {
  id: string;
  user_id: string;
  email: string;
  token: string;
  expires_at: Date;
  verified: boolean;
}

// Phone verification
export interface PhoneVerification {
  id: string;
  user_id: string;
  phone_number: string;
  code: string;
  expires_at: Date;
  verified: boolean;
  attempts: number;
}

// Audit log
export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource: string;
  resource_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address: string;
  user_agent: string;
  timestamp: Date;
  success: boolean;
  error_message?: string;
}

// Security configuration
export interface SecurityConfig {
  jwt: {
    access_secret: string;
    refresh_secret: string;
    access_expires_in: string;
    refresh_expires_in: string;
    issuer: string;
    audience: string;
  };
  bcrypt: {
    salt_rounds: number;
  };
  session: {
    secret: string;
    max_age: number;
    secure: boolean;
    http_only: boolean;
    same_site: 'strict' | 'lax' | 'none';
  };
  cors: {
    origin: string[];
    credentials: boolean;
  };
  helmet: {
    contentSecurityPolicy: boolean;
    crossOriginEmbedderPolicy: boolean;
  };
}

// Risk assessment
export interface RiskAssessment {
  risk_score: number; // 0-100
  risk_factors: RiskFactor[];
  recommended_action: 'allow' | 'challenge' | 'block';
  additional_verification?: string[];
}

export interface RiskFactor {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  value: any;
}

// Geolocation data
export interface GeolocationData {
  country: string;
  country_code: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
  isp: string;
  proxy: boolean;
  tor: boolean;
  vpn: boolean;
}

// WebAuthn credentials
export interface WebAuthnCredential {
  id: string;
  user_id: string;
  credential_id: string;
  public_key: string;
  counter: number;
  transports: string[];
  device_type: string;
  backed_up: boolean;
  created_at: Date;
  last_used: Date;
}
