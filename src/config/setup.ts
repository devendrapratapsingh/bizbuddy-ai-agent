import { config } from './index';
import { envConfig } from './vars';

// Setup function to initialize configuration
export const setupConfig = (): void => {
  // Validate environment variables
  validateEnv(envConfig);

  // Setup database connection
  setupDatabase();

  // Setup logging
  setupLogging();

  // Setup security
  setupSecurity();

  console.log('Configuration setup completed successfully');
};

const validateEnv = (env: typeof envConfig): void => {
  const requiredVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'OPENAI_API_KEY'
  ];

  const missingVars = requiredVars.filter(varName => !env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
};

const setupDatabase = (): void => {
  console.log('Setting up database connection...');
  // Prisma client is already initialized in database.ts
  // Additional database setup can be done here
};

const setupLogging = (): void => {
  console.log('Setting up logging...');
  // Setup logging based on config
  // This could include Winston, Pino, or other logging libraries
};

const setupSecurity = (): void => {
  console.log('Setting up security...');
  // Setup security middleware based on config
  // This could include helmet, cors, rate limiting, etc.
};

export const getConfig = (): typeof config => {
  return config;
};