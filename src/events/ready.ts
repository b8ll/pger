import { Client, Events, ActivityType } from 'discord.js';
import { logger } from '../services/core/logger';
import { deployCommands } from '../utils/deployCommands';
import { IEvent } from '../interfaces/IEvent';

export const event: IEvent = {
  name: Events.ClientReady,
  once: true,
  async execute(client: Client): Promise<void> {
    try {
      await deployCommands();
      
      // Set bot presence
      client.user?.setPresence({
        activities: [{
          name: '/help | Serving communities',
          type: ActivityType.Watching
        }],
        status: 'online'
      });
      
      logger.info(`Ready! Logged in as ${client.user?.tag}`);
      logger.info('Bot is ready and fully operational');
    } catch (error) {
      logger.error('Error in ready event:', error);
    }
  }
}; 