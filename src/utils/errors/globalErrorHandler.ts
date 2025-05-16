import { Client } from 'discord.js';
import { logger } from '../../services/logger';
import { CustomError } from './CustomError';

export function setupGlobalErrorHandlers(client: Client): void {
  process.on('unhandledRejection', (reason: Error) => {
    logger.error('Unhandled Promise Rejection:', {
      error: reason.message,
      stack: reason.stack
    });
    // Optionally notify administrators through Discord
    notifyAdmins(client, 'Unhandled Promise Rejection', reason);
  });

  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', {
      error: error.message,
      stack: error.stack
    });
    // Notify administrators and gracefully shutdown
    notifyAdmins(client, 'Uncaught Exception', error)
      .finally(() => {
        process.exit(1);
      });
  });

  client.on('error', (error) => {
    logger.error('Discord Client Error:', {
      error: error.message,
      stack: error.stack
    });
    notifyAdmins(client, 'Discord Client Error', error);
  });
}

async function notifyAdmins(client: Client, type: string, error: Error): Promise<void> {
  const adminIds = process.env.ADMIN_IDS?.split(',') || [];
  
  const errorMessage = `🚨 **${type}**\n`
    + `\`\`\`\nMessage: ${error.message}\n`
    + `Type: ${error.constructor.name}\n`
    + `${error.stack ? `Stack: ${error.stack.slice(0, 1000)}` : ''}\`\`\``;

  for (const adminId of adminIds) {
    try {
      const admin = await client.users.fetch(adminId);
      await admin.send(errorMessage);
    } catch (err) {
      logger.error(`Failed to notify admin ${adminId}:`, err);
    }
  }
} 