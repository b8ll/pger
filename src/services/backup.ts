import { promises as fs } from 'fs';
import path from 'path';
import { logger } from './logger';
import { gzip } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);

export class BackupService {
  private readonly backupDir: string;
  private readonly maxBackups: number;

  constructor(backupDir: string = 'backups', maxBackups: number = 5) {
    this.backupDir = backupDir;
    this.maxBackups = maxBackups;
    this.initializeBackupDir();
  }

  private async initializeBackupDir(): Promise<void> {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
    } catch (error) {
      logger.error('Failed to create backup directory:', error);
    }
  }

  public async createBackup(data: any): Promise<void> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `backup-${timestamp}.json.gz`;
      const filePath = path.join(this.backupDir, fileName);

      const jsonData = JSON.stringify(data, null, 2);
      const compressed = await gzipAsync(Buffer.from(jsonData));

      await fs.writeFile(filePath, compressed);
      logger.info(`Backup created successfully: ${fileName}`);

      await this.cleanOldBackups();
    } catch (error) {
      logger.error('Failed to create backup:', error);
      throw error;
    }
  }

  private async cleanOldBackups(): Promise<void> {
    try {
      const files = await fs.readdir(this.backupDir);
      const backupFiles = files
        .filter(file => file.startsWith('backup-'))
        .sort((a, b) => b.localeCompare(a));

      if (backupFiles.length > this.maxBackups) {
        const filesToDelete = backupFiles.slice(this.maxBackups);
        for (const file of filesToDelete) {
          await fs.unlink(path.join(this.backupDir, file));
          logger.debug(`Deleted old backup: ${file}`);
        }
      }
    } catch (error) {
      logger.error('Failed to clean old backups:', error);
    }
  }

  public async restoreFromLatest(): Promise<any> {
    try {
      const files = await fs.readdir(this.backupDir);
      const latestBackup = files
        .filter(file => file.startsWith('backup-'))
        .sort((a, b) => b.localeCompare(a))[0];

      if (!latestBackup) {
        throw new Error('No backup files found');
      }

      const filePath = path.join(this.backupDir, latestBackup);
      const compressed = await fs.readFile(filePath);
      const decompressed = await gzipAsync(compressed);
      
      return JSON.parse(decompressed.toString());
    } catch (error) {
      logger.error('Failed to restore from backup:', error);
      throw error;
    }
  }
} 