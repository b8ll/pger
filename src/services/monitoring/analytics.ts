import { Client, Collection } from 'discord.js';
import { logger } from '../core/logger';

interface AnalyticsData {
  guildStats: Map<string, GuildStats>;
  userStats: Map<string, UserStats>;
  commandStats: CommandStats;
  timeStats: TimeStats;
}

interface GuildStats {
  memberCount: number;
  activeUsers: Set<string>;
  commandUsage: number;
  lastActive: Date;
}

interface UserStats {
  commandsUsed: number;
  favoriteCommands: Map<string, number>;
  lastActive: Date;
  guildActivity: Map<string, number>;
}

interface CommandStats {
  totalUsage: number;
  commandUsage: Map<string, number>;
  averageResponseTime: number;
  failureRate: Map<string, number>;
}

interface TimeStats {
  hourlyActivity: number[];
  dailyActivity: number[];
  weeklyActivity: number[];
}

export class AnalyticsService {
  private data: AnalyticsData;
  private readonly client: Client;

  constructor(client: Client) {
    this.client = client;
    this.data = this.initializeData();
    this.startAnalytics();
  }

  private initializeData(): AnalyticsData {
    return {
      guildStats: new Map(),
      userStats: new Map(),
      commandStats: {
        totalUsage: 0,
        commandUsage: new Map(),
        averageResponseTime: 0,
        failureRate: new Map()
      },
      timeStats: {
        hourlyActivity: new Array(24).fill(0),
        dailyActivity: new Array(7).fill(0),
        weeklyActivity: new Array(52).fill(0)
      }
    };
  }

  public trackCommand(
    userId: string,
    guildId: string,
    commandName: string,
    responseTime: number,
    success: boolean
  ): void {
    try {
      this.updateUserStats(userId, guildId, commandName);
      this.updateGuildStats(guildId);
      this.updateCommandStats(commandName, responseTime, success);
      this.updateTimeStats();
    } catch (error) {
      logger.error('Error tracking analytics:', error);
    }
  }

  private updateUserStats(userId: string, guildId: string, commandName: string): void {
    const userStats = this.data.userStats.get(userId) || {
      commandsUsed: 0,
      favoriteCommands: new Map(),
      lastActive: new Date(),
      guildActivity: new Map()
    };

    userStats.commandsUsed++;
    userStats.lastActive = new Date();
    userStats.favoriteCommands.set(
      commandName,
      (userStats.favoriteCommands.get(commandName) || 0) + 1
    );
    userStats.guildActivity.set(
      guildId,
      (userStats.guildActivity.get(guildId) || 0) + 1
    );

    this.data.userStats.set(userId, userStats);
  }

  private updateGuildStats(guildId: string): void {
    const guild = this.client.guilds.cache.get(guildId);
    if (!guild) return;

    const guildStats = this.data.guildStats.get(guildId) || {
      memberCount: 0,
      activeUsers: new Set(),
      commandUsage: 0,
      lastActive: new Date()
    };

    guildStats.memberCount = guild.memberCount;
    guildStats.commandUsage++;
    guildStats.lastActive = new Date();

    this.data.guildStats.set(guildId, guildStats);
  }

  private updateCommandStats(commandName: string, responseTime: number, success: boolean): void {
    this.data.commandStats.totalUsage++;
    this.data.commandStats.commandUsage.set(
      commandName,
      (this.data.commandStats.commandUsage.get(commandName) || 0) + 1
    );

    const oldAvg = this.data.commandStats.averageResponseTime;
    const totalCommands = this.data.commandStats.totalUsage;
    this.data.commandStats.averageResponseTime =
      (oldAvg * (totalCommands - 1) + responseTime) / totalCommands;

    if (!success) {
      this.data.commandStats.failureRate.set(
        commandName,
        (this.data.commandStats.failureRate.get(commandName) || 0) + 1
      );
    }
  }

  private updateTimeStats(): void {
    const now = new Date();
    this.data.timeStats.hourlyActivity[now.getHours()]++;
    this.data.timeStats.dailyActivity[now.getDay()]++;
    this.data.timeStats.weeklyActivity[Math.floor(now.getDate() / 7)]++;
  }

  public getAnalytics(): AnalyticsData {
    return this.data;
  }

  public getTopCommands(limit: number = 10): Array<{ command: string; usage: number }> {
    return Array.from(this.data.commandStats.commandUsage.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([command, usage]) => ({ command, usage }));
  }

  public getMostActiveUsers(limit: number = 10): Array<{ userId: string; activity: number }> {
    return Array.from(this.data.userStats.entries())
      .sort((a, b) => b[1].commandsUsed - a[1].commandsUsed)
      .slice(0, limit)
      .map(([userId, stats]) => ({ userId, activity: stats.commandsUsed }));
  }

  private startAnalytics(): void {
    setInterval(() => {
      this.cleanupOldData();
    }, 24 * 60 * 60 * 1000);
  }

  private cleanupOldData(): void {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    for (const [userId, stats] of this.data.userStats) {
      if (stats.lastActive < thirtyDaysAgo) {
        this.data.userStats.delete(userId);
      }
    }

    for (const [guildId, stats] of this.data.guildStats) {
      if (stats.lastActive < thirtyDaysAgo) {
        this.data.guildStats.delete(guildId);
      }
    }

    logger.info('Analytics cleanup completed');
  }
} 