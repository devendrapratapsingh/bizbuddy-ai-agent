import { config } from './index';

// Type definitions for environment variables
export type EnvConfig = {
  // Server
  PORT?: string;
  HOST?: string;
  NODE_ENV?: string;
  CORS_ORIGIN?: string;
  CORS_ORIGINS?: string;

  // Database
  DATABASE_URL?: string;
  DB_SSL?: string;
  DB_POOL_MAX?: string;
  DB_POOL_MIN?: string;
  DB_POOL_IDLE_TIME?: string;

  // JWT
  JWT_SECRET?: string;
  JWT_EXPIRES_IN?: string;
  JWT_REFRESH_EXPIRES_IN?: string;

  // OpenAI
  OPENAI_API_KEY?: string;
  OPENAI_ORGANIZATION_ID?: string;
  OPENAI_MODEL?: string;
  OPENAI_MAX_TOKENS?: string;
  OPENAI_TEMPERATURE?: string;
  OPENAI_PRESENCE_PENALTY?: string;
  OPENAI_FREQUENCY_PENALTY?: string;

  // Socket.IO
  SOCKET_IO_SECRET?: string;
  SOCKET_IO_CORS_ORIGIN?: string;
  SOCKET_IO_MAX_BUFFER?: string;

  // WebRTC
  WEBRTC_CONFIG?: string;

  // Application
  MAX_CONCURRENT_CALLS?: string;
  CONVERSATION_TIMEOUT?: string;
  LEAD_QUALIFICATION_THRESHOLD?: string;
  CONVERSION_PROBABILITY_THRESHOLD?: string;
  LOG_LEVEL?: string;

  // Security
  CORS_ORIGINS?: string;

  // Logging
  LOG_LEVEL?: string;
  LOG_FORMAT?: string;
  LOG_OUTPUT?: string;

  // Multi-Tenancy
 tenantId?: string;
  DEFAULT_TENANT_ID?: string;

  // Email
  EMAIL_FROM?: string;
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_SECURE?: string;
  SMTP_USER?: string;
  SMTP_PASS?: string;

  // Storage
  UPLOAD_MAX_SIZE?: string;
  UPLOAD_ALLOWED_TYPES?: string;
  UPLOAD_TEMP_DIR?: string;
  CLOUD_PROVIDER?: string;
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  AWS_REGION?: string;
  AWS_S3_BUCKET?: string;
  GCP_PROJECT_ID?: string;
  GCP_KEY_FILENAME?: string;
  GCP_STORAGE_BUCKET?: string;
};

// Validate environment variables
export const validateEnv = (env: EnvConfig): void => {
  const requiredVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'OPENAI_API_KEY'
  ];

  const missingVars = requiredVars.filter(varName => !env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  // Validate port
  if (env.PORT && isNaN(parseInt(env.PORT, 10))) {
    throw new Error('PORT must be a number');
  }

  // Validate database pool settings
  if (env.DB_POOL_MAX && isNaN(parseInt(env.DB_POOL_MAX, 10))) {
    throw new Error('DB_POOL_MAX must be a number');
  }
  if (env.DB_POOL_MIN && isNaN(parseInt(env.DB_POOL_MIN, 10))) {
    throw new Error('DB_POOL_MIN must be a number');
  }
  if (env.DB_POOL_IDLE_TIME && isNaN(parseInt(env.DB_POOL_IDLE_TIME, 10))) {
    throw new Error('DB_POOL_IDLE_TIME must be a number');
  }

  // Validate OpenAI settings
  if (env.OPENAI_MAX_TOKENS && isNaN(parseInt(env.OPENAI_MAX_TOKENS, 10))) {
    throw new Error('OPENAI_MAX_TOKENS must be a number');
  }
  if (env.OPENAI_TEMPERATURE && isNaN(parseFloat(env.OPENAI_TEMPERATURE))) {
    throw new Error('OPENAI_TEMPERATURE must be a number');
  }
  if (env.OPENAI_PRESENCE_PENALTY && isNaN(parseFloat(env.OPENAI_PRESENCE_PENALTY))) {
    throw new Error('OPENAI_PRESENCE_PENALTY must be a number');
  }
  if (env.OPENAI_FREQUENCY_PENALTY && isNaN(parseFloat(env.OPENAI_FREQUENCY_PENALTY))) {
    throw new Error('OPENAI_FREQUENCY_PENALTY must be a number');
  }

  // Validate application settings
  if (env.MAX_CONCURRENT_CALLS && isNaN(parseInt(env.MAX_CONCURRENT_CALLS, 10))) {
    throw new Error('MAX_CONCURRENT_CALLS must be a number');
  }
  if (env.CONVERSATION_TIMEOUT && isNaN(parseInt(env.CONVERSATION_TIMEOUT, 10))) {
    throw new Error('CONVERSATION_TIMEOUT must be a number');
  }
  if (env.LEAD_QUALIFICATION_THRESHOLD && isNaN(parseFloat(env.LEAD_QUALIFICATION_THRESHOLD))) {
    throw new Error('LEAD_QUALIFICATION_THRESHOLD must be a number');
  }
  if (env.CONVERSION_PROBABILITY_THRESHOLD && isNaN(parseFloat(env.CONVERSION_PROBABILITY_THRESHOLD))) {
    throw new Error('CONVERSION_PROBABILITY_THRESHOLD must be a number');
  }

  // Validate upload settings
  if (env.UPLOAD_MAX_SIZE && isNaN(parseInt(env.UPLOAD_MAX_SIZE, 10))) {
    throw new Error('UPLOAD_MAX_SIZE must be a number');
  }

  // Validate SMTP settings
  if (env.SMTP_PORT && isNaN(parseInt(env.SMTP_PORT, 10))) {
    throw new Error('SMTP_PORT must be a number');
  }
};

// Validate environment variables
validateEnv(process.env);

// Export validated configuration
export const envConfig = process.env as EnvConfig;