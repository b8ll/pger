import { logger } from '../services/logger';

export function validateEnv(): void {
  const requiredEnvVars = [
    'DISCORD_TOKEN',
    'DATABASE_URL',
    'NODE_ENV'
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      logger.error(`Missing required environment variable: ${envVar}`);
      process.exit(1);
    }
  }
} 