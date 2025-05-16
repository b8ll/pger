import { Client } from 'discord.js';
import { logger } from './logger';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  details: {
    discord: boolean;
    database: boolean;
    memory: boolean;
    latency: number;
  };
  timestamp: Date;
}

export class HealthChecker {
  private readonly client: Client;
  private status: HealthStatus;
  private readonly memoryThreshold: number;
  private readonly latencyThreshold: number;

  constructor(
    client: Client,
    memoryThreshold: number = 1024, // MB
    latencyThreshold: number = 500 // ms
  ) {
    this.client = client;
    this.memoryThreshold = memoryThreshold;
    this.latencyThreshold = latencyThreshold;
    this.status = this.getInitialStatus();
    this.startHealthCheck();
  }

  private getInitialStatus(): HealthStatus {
    return {
      status: 'healthy',
      details: {
        discord: true,
        database: true,
        memory: true,
        latency: 0
      },
      timestamp: new Date()
    };
  }

  private startHealthCheck(): void {
    setInterval(() => {
      this.checkHealth();
    }, 30000); // Check every 30 seconds
  }

  private async checkHealth(): Promise<void> {
    try {
      const details = {
        discord: this.client.ws.status === 0,
        database: await this.checkDatabaseHealth(),
        memory: this.checkMemoryHealth(),
        latency: this.client.ws.ping
      };

      const status = this.calculateOverallStatus(details);

      this.status = {
        status,
        details,
        timestamp: new Date()
      };

      if (status !== 'healthy') {
        logger.warn('Health check detected issues:', this.status);
      }
    } catch (error) {
      logger.error('Health check failed:', error);
    }
  }

  private async checkDatabaseHealth(): Promise<boolean> {
    try {
      // Add your database health check logic here
      return true;
    } catch (error) {
      return false;
    }
  }

  private checkMemoryHealth(): boolean {
    const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;
    return memoryUsage < this.memoryThreshold;
  }

  private calculateOverallStatus(details: HealthStatus['details']): HealthStatus['status'] {
    if (!details.discord || !details.database) {
      return 'unhealthy';
    }

    if (!details.memory || details.latency > this.latencyThreshold) {
      return 'degraded';
    }

    return 'healthy';
  }

  public getStatus(): HealthStatus {
    return this.status;
  }
} 