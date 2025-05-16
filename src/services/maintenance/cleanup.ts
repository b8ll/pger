import { Client, Guild } from 'discord.js';
import { logger } from '../core/logger';
import { promises as fs } from 'fs';
import path from 'path';

export class CleanupService {
  private readonly client: Client;
  private readonly options: CleanupOptions;

  constructor(client: Client, options: Partial<CleanupOptions> = {}) {
    this.client = client;
    this.options = {
      tempFileAge: 24 * 60 * 60 * 1000, // 24 hours
      logFileAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      cacheAge: 60 * 60 * 1000, // 1 hour
      ...options
    };

    this.startCleanupSchedule();
  }

  private startCleanupSchedule(): void {
    // Run cleanup every hour
    setInterval(() => {
      this.runCleanup().catch(error => {
        logger.error('Cleanup failed:', error);
      });
    }, 60 * 60 * 1000);
  }

  private async runCleanup(): Promise<void> {
    logger.info('Starting cleanup process');

    await Promise.all([
      this.cleanupTempFiles(),
      this.cleanupLogs(),
      this.cleanupCache(),
      this.cleanupInactiveGuilds()
    ]);

    logger.info('Cleanup process completed');
  }

  private async cleanupTempFiles(): Promise<void> {
    try {
      const tempDir = path.join(process.cwd(), 'temp');
      await fs.mkdir(tempDir, { recursive: true });
      const files = await fs.readdir(tempDir);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(tempDir, file);
        const stats = await fs.stat(filePath);

        if (now - stats.mtimeMs > this.options.tempFileAge) {
          await fs.unlink(filePath);
          logger.debug(`Deleted temp file: ${file}`);
        }
      }
    } catch (error) {
      logger.error('Error cleaning up temp files:', error);
    }
  }

  private async cleanupLogs(): Promise<void> {
    try {
      const logsDir = path.join(process.cwd(), 'logs');
      await fs.mkdir(logsDir, { recursive: true });
      const files = await fs.readdir(logsDir);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(logsDir, file);
        const stats = await fs.stat(filePath);

        if (now - stats.mtimeMs > this.options.logFileAge) {
          await fs.unlink(filePath);
          logger.debug(`Deleted old log file: ${file}`);
        }
      }
    } catch (error) {
      logger.error('Error cleaning up log files:', error);
    }
  }

  private async cleanupCache(): Promise<void> {
    try {
      this.client.guilds.cache.forEach(guild => {
        if (guild.channels.cache.size) {
          guild.channels.cache.forEach(channel => {
            if (channel.isTextBased()) {
              channel.messages?.cache.sweep(msg => 
                Date.now() - msg.createdTimestamp > this.options.cacheAge
              );
            }
          });
        }
      });

      logger.debug('Cache cleanup completed');
    } catch (error) {
      logger.error('Error cleaning up cache:', error);
    }
  }

  private async cleanupInactiveGuilds(): Promise<void> {
    try {
      const inactiveGuilds = this.client.guilds.cache.filter(guild => {
        const channels = guild.channels.cache.filter(channel => channel.isTextBased());
        const lastMessage = Array.from(channels.values())
          .map(channel => channel.lastMessage)
          .filter(Boolean)
          .sort((a, b) => (b?.createdTimestamp || 0) - (a?.createdTimestamp || 0))[0];

        return lastMessage && Date.now() - lastMessage.createdTimestamp > 30 * 24 * 60 * 60 * 1000;
      });

      logger.info(`Found ${inactiveGuilds.size} inactive guilds`);
    } catch (error) {
      logger.error('Error cleaning up inactive guilds:', error);
    }
  }
}

interface CleanupOptions {
  tempFileAge: number;
  logFileAge: number;
  cacheAge: number;
}