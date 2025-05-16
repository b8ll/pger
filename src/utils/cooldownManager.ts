import { Collection } from 'discord.js';
import { logger } from '../services/logger';

export class CooldownManager {
  private cooldowns: Collection<string, Collection<string, number>> = new Collection();

  public checkCooldown(
    userId: string,
    commandName: string,
    cooldownAmount: number
  ): { onCooldown: boolean; timeLeft: number } {
    if (!this.cooldowns.has(commandName)) {
      this.cooldowns.set(commandName, new Collection());
    }

    const now = Date.now();
    const timestamps = this.cooldowns.get(commandName)!;
    const cooldownEnd = timestamps.get(userId);

    if (cooldownEnd) {
      const timeLeft = cooldownEnd - now;
      if (timeLeft > 0) {
        return { onCooldown: true, timeLeft };
      }
    }

    timestamps.set(userId, now + cooldownAmount);
    setTimeout(() => timestamps.delete(userId), cooldownAmount);

    return { onCooldown: false, timeLeft: 0 };
  }

  public clearUserCooldowns(userId: string): void {
    this.cooldowns.forEach(commandCooldowns => {
      commandCooldowns.delete(userId);
    });
    logger.debug(`Cleared all cooldowns for user ${userId}`);
  }
} 