import { Client, Collection } from 'discord.js';
import { logger } from './logger';

interface Metrics {
  commandUsage: Collection<string, number>;
  errors: Collection<string, number>;
  responseTime: number[];
  uptime: number;
  memoryUsage: number[];
}

export class MetricsCollector {
  private metrics: Metrics;
  private readonly client: Client;
  private startTime: number;

  constructor(client: Client) {
    this.client = client;
    this.startTime = Date.now();
    this.metrics = {
      commandUsage: new Collection(),
      errors: new Collection(),
      responseTime: [],
      uptime: 0,
      memoryUsage: []
    };

    this.startCollecting();
  }

  public trackCommandUsage(commandName: string): void {
    const current = this.metrics.commandUsage.get(commandName) || 0;
    this.metrics.commandUsage.set(commandName, current + 1);
  }

  public trackError(errorType: string): void {
    const current = this.metrics.errors.get(errorType) || 0;
    this.metrics.errors.set(errorType, current + 1);
  }

  public trackResponseTime(ms: number): void {
    this.metrics.responseTime.push(ms);
    if (this.metrics.responseTime.length > 1000) {
      this.metrics.responseTime.shift();
    }
  }

  public getMetrics(): Metrics {
    return {
      ...this.metrics,
      uptime: Date.now() - this.startTime
    };
  }

  private startCollecting(): void {
    // Collect metrics every minute
    setInterval(() => {
      this.collectMetrics();
    }, 60000);
  }

  private collectMetrics(): void {
    const memUsage = process.memoryUsage().heapUsed / 1024 / 1024;
    this.metrics.memoryUsage.push(memUsage);

    if (this.metrics.memoryUsage.length > 60) {
      this.metrics.memoryUsage.shift();
    }

    logger.debug('Metrics collected', {
      memoryUsage: `${memUsage.toFixed(2)}MB`,
      commandCount: this.metrics.commandUsage.reduce((acc, val) => acc + val, 0),
      errorCount: this.metrics.errors.reduce((acc, val) => acc + val, 0),
      avgResponseTime: this.getAverageResponseTime()
    });
  }

  private getAverageResponseTime(): number {
    if (this.metrics.responseTime.length === 0) return 0;
    const sum = this.metrics.responseTime.reduce((acc, val) => acc + val, 0);
    return sum / this.metrics.responseTime.length;
  }
} 