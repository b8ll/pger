import { Client } from 'discord.js';
import { logger } from '../core/logger';
import { CronJob } from 'cron';
import { DateTime } from 'luxon';

interface ScheduledTask {
  id: string;
  name: string;
  cronExpression: string;
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  job: CronJob;
}

export class SchedulerService {
  private tasks: Map<string, ScheduledTask> = new Map();
  private readonly client: Client;

  constructor(client: Client) {
    this.client = client;
    this.initializeDefaultTasks();
  }

  private initializeDefaultTasks(): void {
    // Daily maintenance at 3 AM
    this.scheduleTask({
      id: 'daily-maintenance',
      name: 'Daily Maintenance',
      cronExpression: '0 3 * * *',
      task: () => this.runMaintenance()
    });

    // Weekly backup every Sunday at 2 AM
    this.scheduleTask({
      id: 'weekly-backup',
      name: 'Weekly Backup',
      cronExpression: '0 2 * * 0',
      task: () => this.runWeeklyBackup()
    });

    // Hourly metrics collection
    this.scheduleTask({
      id: 'hourly-metrics',
      name: 'Hourly Metrics',
      cronExpression: '0 * * * *',
      task: () => this.collectMetrics()
    });
  }

  public scheduleTask({ id, name, cronExpression, task }: {
    id: string;
    name: string;
    cronExpression: string;
    task: () => Promise<void> | void;
  }): void {
    try {
      const job = new CronJob(
        cronExpression,
        async () => {
          try {
            const nextRun = DateTime.fromJSDate(job.nextDate().toJSDate());
            logger.info(`Running scheduled task: ${name}`);
            await task();
            this.updateTaskStatus(id);
            logger.info(`Next run for ${name}: ${nextRun.toISO()}`);
          } catch (error) {
            logger.error(`Error in scheduled task ${name}:`, error);
          }
        },
        null,
        true
      );

      const scheduledTask: ScheduledTask = {
        id,
        name,
        cronExpression,
        enabled: true,
        job
      };

      this.tasks.set(id, scheduledTask);
      job.start();
      this.updateTaskStatus(id);

      logger.info(`Scheduled new task: ${name} (${cronExpression})`);
    } catch (error) {
      logger.error(`Failed to schedule task ${name}:`, error);
    }
  }

  private updateTaskStatus(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.lastRun = new Date();
      task.nextRun = task.job.nextDate().toJSDate();
    }
  }

  private async runMaintenance(): Promise<void> {
    // Add your maintenance tasks here
    logger.info('Running daily maintenance tasks');
  }

  private async runWeeklyBackup(): Promise<void> {
    // Add your backup logic here
    logger.info('Running weekly backup');
  }

  private async collectMetrics(): Promise<void> {
    // Add your metrics collection logic here
    logger.info('Collecting hourly metrics');
  }

  public getTaskStatus(taskId: string): Partial<ScheduledTask> | null {
    const task = this.tasks.get(taskId);
    if (!task) return null;

    return {
      id: task.id,
      name: task.name,
      enabled: task.enabled,
      lastRun: task.lastRun,
      nextRun: task.nextRun
    };
  }

  public getAllTasks(): Array<Partial<ScheduledTask>> {
    return Array.from(this.tasks.values()).map(task => ({
      id: task.id,
      name: task.name,
      enabled: task.enabled,
      lastRun: task.lastRun,
      nextRun: task.nextRun
    }));
  }

  public toggleTask(taskId: string, enabled: boolean): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;

    task.enabled = enabled;
    if (enabled) {
      task.job.start();
    } else {
      task.job.stop();
    }

    logger.info(`Task ${task.name} ${enabled ? 'enabled' : 'disabled'}`);
    return true;
  }

  public stop(name: string): void {
    const task = this.tasks.get(name);
    if (task && task.job) {
      task.job.stop();
      this.tasks.delete(name);
      logger.info(`Stopped scheduled task: ${name}`);
    }
  }

  public stopAll(): void {
    for (const [name, task] of this.tasks) {
      task.job.stop();
      logger.info(`Stopped scheduled task: ${name}`);
    }
    this.tasks.clear();
  }
} 