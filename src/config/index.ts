import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server Configuration
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || 'localhost',
    env: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3001'
  },

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/bizbuddy_db',
    ssl: process.env.DB_SSL === 'true',
    pool: {
      maxConnections: parseInt(process.env.DB_POOL_MAX || '10', 10),
      minConnections: parseInt(process.env.DB_POOL_MIN || '1', 10),
      maxIdleTime: parseInt(process.env.DB_POOL_IDLE_TIME || '30000', 10)
    }
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },

  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    organizationId: process.env.OPENAI_ORGANIZATION_ID || '',
    model: process.env.OPENAI_MODEL || 'gpt-4',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '1000', 10),
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
    presencePenalty: parseFloat(process.env.OPENAI_PRESENCE_PENALTY || '0.1'),
    frequencyPenalty: parseFloat(process.env.OPENAI_FREQUENCY_PENALTY || '0.1')
  },

  // Socket.IO Configuration
  socket: {
    secret: process.env.SOCKET_IO_SECRET || 'fallback-secret',
    corsOrigin: process.env.SOCKET_IO_CORS_ORIGIN || 'http://localhost:3001',
    maxHttpBufferSize: parseInt(process.env.SOCKET_IO_MAX_BUFFER || '1e8', 10)
  },

  // WebRTC Configuration
  webrtc: {
    iceServers: JSON.parse(process.env.WEBRTC_CONFIG || '[]')
  },

  // Application Configuration
  app: {
    maxConcurrentCalls: parseInt(process.env.MAX_CONCURRENT_CALLS || '10', 10),
    conversationTimeout: parseInt(process.env.CONVERSATION_TIMEOUT || '1800000', 10),
    leadQualificationThreshold: parseFloat(process.env.LEAD_QUALIFICATION_THRESHOLD || '0.7'),
    conversionProbabilityThreshold: parseFloat(process.env.CONVERSION_PROBABILITY_THRESHOLD || '0.6'),
    logLevel: process.env.LOG_LEVEL || 'info'
  },

  // Security Configuration
  security: {
    corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3001').split(','),
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "ws:", "wss:"]
        }
      }
    }
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    output: process.env.LOG_OUTPUT || 'console'
  },

  // Email Configuration
  email: {
    from: process.env.EMAIL_FROM || 'noreply@bizbuddy.ai',
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    }
  },

  // Storage Configuration
  storage: {
    uploads: {
      maxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '10485760', 10), // 10MB
      allowedTypes: (process.env.UPLOAD_ALLOWED_TYPES || 'image/*,video/*,.pdf,.doc,.docx,.txt').split(','),
      tempDir: process.env.UPLOAD_TEMP_DIR || './uploads/temp'
    },
    cloud: {
      provider: process.env.CLOUD_PROVIDER || 'local',
      aws: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'us-east-1',
        bucket: process.env.AWS_S3_BUCKET
      },
      gcp: {
        projectId: process.env.GCP_PROJECT_ID,
        keyFilename: process.env.GCP_KEY_FILENAME,
        bucket: process.env.GCP_STORAGE_BUCKET
      }
    }
  }
} as const;

export type Config = typeof config;